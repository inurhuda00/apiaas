import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { database } from "@apiaas/db";
import {
	createProduct,
	generateProductSlug,
	getProduct,
} from "../db/queries/product";
import {
	productSchema,
	mediaUploadSchema,
	fileUploadSchema,
	createValidator,
} from "../helpers/validation";
import { handleError } from "../helpers/error";
import {
	deleteBucketObject,
	getBucketObject,
	uploadToBucket,
} from "../helpers/bucket";
import { listBucketObjects } from "../helpers/bucket";

const productRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

productRoute.use("/*", AuthRoleMiddleware(["admin", "free"]));

productRoute.post("/create", createValidator(productSchema), async (c) => {
	try {
		const data = c.req.valid("json");
		const user = c.get("user");

		const db = database(c.env.DATABASE_URL);
		const slug = await generateProductSlug(db, data.name);

		const newProduct = await createProduct(db, {
			slug,
			price: 0,
			categoryId: 1,
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

productRoute.post(
	"/media",
	createValidator(mediaUploadSchema, "form"),
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

productRoute.post("/files", createValidator(fileUploadSchema), async (c) => {
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
});

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

productRoute.post("/files/download/:productId", async (c) => {
	try {
		const productId = c.req.param("productId");
		const filename = c.req.param("filename");

		const db = database(c.env.DATABASE_URL);
		const product = await getProduct(db, productId);

		if (!product) {
			throw new Error("Product not found");
		}

		const file = await getBucketObject(c, productId, "files", filename);

		c.header("Content-Type", file.type);
		c.header("Content-Disposition", `attachment; filename="${filename}"`);
		c.header("Content-Length", file.size.toString());
		c.header("Content-Transfer-Encoding", "binary");
		c.header("Cache-Control", "no-cache, no-store, must-revalidate");
		c.header("Pragma", "no-cache");
		c.header("Expires", "0");
		return c.body(file.body);
	} catch (error) {
		return handleError(c, error, "Failed to download file");
	}
});

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
