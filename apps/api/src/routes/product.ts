import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { database } from "@apiaas/db";
import { createProduct, generateProductSlug } from "../db/queries/product";
import { transformZodError } from "../../../../packages/utils/zod-transformer";

const productRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

productRoute.use("/*", AuthRoleMiddleware(["admin", "free"]));

const productSchema = z.object({
	name: z.string().min(1, { message: "Product name is required" }),
	description: z.string().optional(),
	price: z.string().min(1, { message: "Price is required" }),
	category: z.string().min(1, { message: "Category is required" }),
});

const mediaUploadSchema = z.object({
	productId: z.number().min(1, { message: "Product ID is required" }),
	file: z.instanceof(File, { message: "File is required" }).refine(
		(file) => {
			const allowedMimeTypes = [
				"image/jpeg",
				"image/png",
				"image/gif",
				"image/webp",
				"image/svg+xml",
			];
			return allowedMimeTypes.includes(file.type);
		},
		{
			message:
				"Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.",
		},
	),
	isPrimary: z.preprocess(
		(val) => val === "true" || val === true,
		z.boolean().optional().default(false),
	),
});

const fileUploadSchema = z.object({
	productId: z.number().min(1, { message: "Product ID is required" }),
	file: z.instanceof(File, { message: "File is required" }).refine(
		(file) => {
			const allowedFileTypes = [
				"application/pdf",
				"application/zip",
				"image/svg+xml",
				"application/illustrator",
				"image/x-eps",
				"application/postscript",
			];
			return allowedFileTypes.includes(file.type);
		},
		{
			message:
				"Invalid file type. Only PDF, ZIP, SVG, and vector files are allowed.",
		},
	),
});

const generateUniqueFilename = (originalName: string) => {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 10);
	const ext = originalName.split(".").pop();
	return `${timestamp}-${randomString}.${ext}`;
};

// Helper function to handle errors
const handleError = (c: any, error: any, defaultMessage: string) => {
	console.error(defaultMessage, error);
	return c.json(
		{
			success: false,
			error: error instanceof Error ? error.message : defaultMessage,
		},
		500,
	);
};

// Validator middleware factory
const createValidator = (schema: z.ZodSchema) => {
	return zValidator("json", schema, (result, c) => {
		if (!result.success) {
			const error = transformZodError(result.error);
			return c.json(error, 422);
		}
	});
};

// Form validator middleware factory
const createFormValidator = (schema: z.ZodSchema) => {
	return zValidator("form", schema, (result, c) => {
		if (!result.success) {
			const error = transformZodError(result.error);
			return c.json(error, 422);
		}
	});
};

productRoute.post("/create", createValidator(productSchema), async (c) => {
	try {
		const data = c.req.valid("json");
		const user = c.get("user");

		const db = database(c.env.DATABASE_URL);
		const slug = await generateProductSlug(db, data.name);

		const newProduct = await createProduct(db, {
			slug,
			price: 0,
			categoryId: 0,
			ownerId: user.id,
			locked: false,
		});

		if (!newProduct) {
			throw new Error("Failed to create product");
		}

		return c.json({
			success: true,
			data: {
				id: newProduct.id,
				...data,
				userId: user.id,
				createdAt: new Date().toISOString(),
			},
		});
	} catch (error) {
		return handleError(c, error, "Failed to create product");
	}
});

// Helper function to upload file to bucket
const uploadToBucket = async (
	c: any,
	file: File,
	productId: number | string,
	path: string,
	metadata: Record<string, string>,
) => {
	const uniqueFilename = generateUniqueFilename(file.name);

	await c.env.BUCKET.put(
		`products/${productId}/${path}/${uniqueFilename}`,
		file,
		{
			httpMetadata: {
				contentType: file.type,
			},
			customMetadata: {
				...metadata,
				originalName: file.name,
				uploadedAt: new Date().toISOString(),
			},
		},
	);

	return uniqueFilename;
};

productRoute.post(
	"/media",
	createFormValidator(mediaUploadSchema),
	async (c) => {
		try {
			const data = c.req.valid("form");
			const { file, productId, isPrimary } = data;
			const user = c.get("user");

			const uniqueFilename = await uploadToBucket(c, file, productId, "media", {
				userId: user.id.toString(),
				productId: productId.toString(),
				isPrimary: isPrimary.toString(),
			});

			const publicUrl = `https://assets.mondive.xyz/products/${productId}/media/${uniqueFilename}`;

			return c.json({
				success: true,
				data: {
					url: publicUrl,
					filename: uniqueFilename,
					size: file.size,
					type: file.type,
					isPrimary,
				},
			});
		} catch (error) {
			return handleError(c, error, "Failed to upload media");
		}
	},
);

productRoute.post(
	"/files",
	createFormValidator(fileUploadSchema),
	async (c) => {
		try {
			const data = await c.req.valid("form");
			const { file, productId } = data;
			const user = c.get("user");

			const uniqueFilename = await uploadToBucket(c, file, productId, "files", {
				userId: user.id.toString(),
				productId: productId.toString(),
			});

			return c.json({
				success: true,
				data: {
					filename: uniqueFilename,
					originalName: file.name,
					size: file.size,
					type: file.type,
				},
			});
		} catch (error) {
			return handleError(c, error, "Failed to upload file");
		}
	},
);

// Helper function to list bucket objects
const listBucketObjects = async (c: any, productId: string, path: string) => {
	if (!productId) {
		return c.json(
			{
				success: false,
				error: "Product ID is required",
			},
			400,
		);
	}

	const prefix = `products/${productId}/${path}/`;
	return await c.env.BUCKET.list({ prefix });
};

productRoute.get("/media/:productId", async (c) => {
	try {
		const productId = c.req.param("productId");
		const objects = await listBucketObjects(c, productId, "media");

		if (!objects) return; // Early return if error response already sent

		const mediaItems = objects.objects.map((obj: any) => {
			const prefix = `products/${productId}/media/`;
			const filename = obj.key.replace(prefix, "");
			return {
				filename,
				url: `https://assets.mondive.xyz/${obj.key}`,
				size: obj.size,
				uploadedAt: obj.uploaded,
				isPrimary: obj.customMetadata?.isPrimary === "true",
				metadata: obj.customMetadata,
			};
		});

		return c.json({
			success: true,
			data: mediaItems,
		});
	} catch (error) {
		return handleError(c, error, "Failed to get media");
	}
});

productRoute.get("/files/:productId", async (c) => {
	try {
		const productId = c.req.param("productId");
		const objects = await listBucketObjects(c, productId, "files");

		if (!objects) return; // Early return if error response already sent

		const files = objects.objects.map((obj: any) => {
			const prefix = `products/${productId}/files/`;
			const filename = obj.key.replace(prefix, "");
			return {
				filename,
				originalName: obj.customMetadata?.originalName,
				size: obj.size,
				uploadedAt: obj.uploaded,
				metadata: obj.customMetadata,
			};
		});

		return c.json({
			success: true,
			data: files,
		});
	} catch (error) {
		return handleError(c, error, "Failed to get files");
	}
});

// Helper function to delete bucket object
const deleteBucketObject = async (
	c: any,
	productId: string,
	path: string,
	filename: string,
) => {
	if (!productId || !filename) {
		return c.json(
			{
				success: false,
				error: "Product ID and filename are required",
			},
			400,
		);
	}

	const key = `products/${productId}/${path}/${filename}`;
	await c.env.BUCKET.delete(key);

	return c.json({
		success: true,
		message: `${path === "media" ? "Media" : "File"} deleted successfully`,
	});
};

productRoute.delete("/media/:productId/:filename", async (c) => {
	try {
		const productId = c.req.param("productId");
		const filename = c.req.param("filename");
		return await deleteBucketObject(c, productId, "media", filename);
	} catch (error) {
		return handleError(c, error, "Failed to delete media");
	}
});

productRoute.delete("/files/:productId/:filename", async (c) => {
	try {
		const productId = c.req.param("productId");
		const filename = c.req.param("filename");
		return await deleteBucketObject(c, productId, "files", filename);
	} catch (error) {
		return handleError(c, error, "Failed to delete file");
	}
});

export default productRoute;
