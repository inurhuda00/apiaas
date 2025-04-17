import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { database } from "@apiaas/db";
import { createProduct, generateProductSlug, getProduct, deleteProduct } from "../db/queries/product";
import {
	productSchema,
	mediaUploadSchema,
	fileUploadSchema,
	createValidator,
	productIdSchema,
	filenameSchema,
	AuthorizationBeaconSchema,
} from "../helpers/validation";
import { handleError } from "../helpers/error";
import { deleteBucketObject, getBucketObject, uploadToBucket, deleteBucketProductFiles } from "../helpers/bucket";
import { listBucketObjects } from "../helpers/bucket";
import { verifyToken } from "@apiaas/auth";

const productRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

productRoute.post(
	"/:productId/cleanup",
	createValidator(productIdSchema, "param"),
	createValidator(AuthorizationBeaconSchema, "json"),
	async (c) => {
		try {
			const productId = c.req.param("productId");
			const { _authorization } = c.req.valid("json");

			console.log("HELOOWW", productId, _authorization);

			const token = _authorization;

			if (!token) {
				return c.json(
					{
						success: false,
						error: "Unauthorized",
					},
					401,
				);
			}

			const session = await verifyToken(token, c.env.AUTH_SECRET);

			if (!session) {
				return c.json({ success: false, error: "Invalid token" }, 401);
			}

			const db = database(c.env.DATABASE_URL);
			const product = await getProduct(db, productId);

			if (!product) {
				return c.json(
					{
						success: false,
						error: "Product not found",
					},
					404,
				);
			}

			// Delete all media files from bucket
			const mediaDeleted = await deleteBucketProductFiles(c, productId, "media");

			// Delete all files from bucket
			const filesDeleted = await deleteBucketProductFiles(c, productId, "files");

			// Delete the product from database
			const productDeleted = await deleteProduct(db, productId);

			if (!productDeleted) {
				return c.json(
					{
						success: false,
						error: "Failed to delete product from database",
					},
					500,
				);
			}

			return c.json({
				success: true,
				data: {
					id: productId,
					mediaDeleted,
					filesDeleted,
				},
				message: "Product and associated files deleted successfully",
			});
		} catch (error) {
			return handleError(c, error, "Failed to delete product");
		}
	},
);

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
			name: data.name,
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

productRoute.post("/media", createValidator(mediaUploadSchema, "form"), async (c) => {
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
});

productRoute.post("/files", createValidator(fileUploadSchema, "form"), async (c) => {
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
		if (!productId) {
			return c.json(
				{
					success: false,
					error: "Product ID is required",
				},
				400,
			);
		}

		const objects = await listBucketObjects(c, productId, "media");

		if (!objects) return; // Early return if error response already sent

		interface BucketObject {
			key: string;
			size: number;
			uploaded: string;
			customMetadata?: Record<string, string>;
		}

		const mediaItems = objects.objects.map((obj: BucketObject) => {
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

productRoute.get("/files/:productId", createValidator(productIdSchema), async (c) => {
	try {
		const productId = c.req.param("productId");

		const db = database(c.env.DATABASE_URL);
		const existingProduct = await getProduct(db, productId);

		if (!existingProduct) {
			return c.json(
				{
					success: false,
					error: "Product not found",
				},
				404,
			);
		}

		const objects = await listBucketObjects(c, productId, "files");

		if (!objects)
			return c.json(
				{
					success: false,
					error: "Failed to get files",
				},
				500,
			);

		interface BucketObject {
			key: string;
			size: number;
			uploaded: string;
			customMetadata?: Record<string, string>;
		}

		const files = objects.objects.map((obj: BucketObject) => {
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

productRoute.post(
	"/files/download/:productId/:filename",
	createValidator(productIdSchema, "param"),
	createValidator(filenameSchema, "param"),
	async (c) => {
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
	},
);

productRoute.delete(
	"/media/:productId/:filename",
	createValidator(productIdSchema, "param"),
	createValidator(filenameSchema, "param"),
	async (c) => {
		try {
			const productId = c.req.param("productId");
			const filename = c.req.param("filename");
			return await deleteBucketObject(c, productId, "media", filename);
		} catch (error) {
			return handleError(c, error, "Failed to delete media");
		}
	},
);

productRoute.delete(
	"/files/:productId/:filename",
	createValidator(productIdSchema, "param"),
	createValidator(filenameSchema, "param"),
	async (c) => {
		try {
			const productId = c.req.param("productId");
			const filename = c.req.param("filename");
			return await deleteBucketObject(c, productId, "files", filename);
		} catch (error) {
			return handleError(c, error, "Failed to delete file");
		}
	},
);

export default productRoute;
