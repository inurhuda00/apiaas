import { Hono } from "hono";
import { AuthRoleMiddleware, extractBearerToken } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { database } from "@apiaas/db";
import { createProduct, generateProductSlug, getProduct, deleteProduct } from "../db/queries/product";
import { createImage, deleteImageByUrl, getProductImages } from "../db/queries/image";
import { createFile, deleteFileByFileName, getProductFiles } from "../db/queries/file";
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
import { eq, not, isNull } from "drizzle-orm";
import { products } from "@apiaas/db/schema";

// Define BucketObject interface
interface BucketObject {
	key: string;
	size: number;
	uploaded: string;
	customMetadata?: Record<string, string>;
}

function getAssetUrl(c: { env: Env }, type: "media" | "files", productId: string, filename: string): string {
	const assetDomain = c.env.ASSET_DOMAIN || "assets.mondive.xyz";
	return `https://${assetDomain}/products/${productId}/${type}/${filename}`;
}

const productRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

productRoute.post(
	"/:productId/cleanup",
	createValidator(productIdSchema, "param"),
	createValidator(AuthorizationBeaconSchema, "json"),
	async (c) => {
		try {
			const productId = c.req.param("productId");
			const { _authorization } = c.req.valid("json");

			if (!_authorization) {
				return c.json({ success: false, error: "Unauthorized" }, 401);
			}

			const session = await verifyToken(_authorization, c.env.AUTH_SECRET);
			if (!session) {
				return c.json({ success: false, error: "Invalid token" }, 401);
			}

			const db = database(c.env.DATABASE_URL);
			const product = await getProduct(db, productId);

			if (!product) {
				return c.json({ success: false, error: "Product not found" }, 404);
			}

			const [mediaDeleted, filesDeleted] = await Promise.all([
				deleteBucketProductFiles(c, productId, "media"),
				deleteBucketProductFiles(c, productId, "files")
			]);

			const productDeleted = await deleteProduct(db, productId);
			if (!productDeleted) {
				return c.json({ success: false, error: "Failed to delete product from database" }, 500);
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

productRoute.get(
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
				return c.json({ success: false, error: "Product not found" }, 404);
			}

			if (product.locked) {
				const token = extractBearerToken(c);
				if (!token) {
					return c.json({ success: false, error: "Authentication required" }, 401);
				}

				const isValid = await verifyToken(token, c.env.AUTH_SECRET);
				if (!isValid) {
					return c.json({ success: false, error: "Invalid token" }, 401);
				}
			}

			const file = await getBucketObject(c, productId, "files", filename);
			if (!file) {
				return c.json({ success: false, error: "File not found" }, 404);
			}

			const headers = new Headers();
			file.writeHttpMetadata(headers);
			headers.set("etag", file.httpEtag);
			headers.set("Content-Type", file.httpMetadata?.contentType || "application/octet-stream");
			headers.set("Content-Disposition", `attachment; filename="${filename}"`);
			headers.set("Content-Length", String(file.size));
			headers.set("Content-Transfer-Encoding", "binary");
			headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
			headers.set("Pragma", "no-cache");
			headers.set("Expires", "0");

			return new Response(file.body, { headers });
		} catch (error) {
			return handleError(c, error, "Failed to download file");
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
			return c.json({ success: false, error: "Failed to create product" }, 500);
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
		const { file, productId, sort } = c.req.valid("form");
		const user = c.get("user");

		const uniqueFilename = await uploadToBucket(c, file, productId, "media", {
			userId: String(user.id),
			productId: String(productId),
			sort: String(sort),
		});

		const publicUrl = getAssetUrl(c, "media", productId, uniqueFilename);

		const db = database(c.env.DATABASE_URL);
		const newImage = await createImage(db, {
			productId: Number(productId),
			url: publicUrl,
			sort: Number(sort),
		});

		return c.json({
			success: true,
			data: {
				id: newImage.id,
				url: publicUrl,
				filename: uniqueFilename,
				size: file.size,
				type: file.type,
				sort,
			},
		});
	} catch (error) {
		return handleError(c, error, "Failed to upload media");
	}
});

productRoute.post("/files", createValidator(fileUploadSchema, "form"), async (c) => {
	try {
		const { file, productId } = await c.req.valid("form");
		const user = c.get("user");

		const uniqueFilename = await uploadToBucket(c, file, productId, "files", {
			userId: String(user.id),
			productId: String(productId),
		});

		const publicUrl = getAssetUrl(c, "files", productId, uniqueFilename);
		const extension = file.name.split(".").pop() || "";

		const db = database(c.env.DATABASE_URL);
		const newFile = await createFile(db, {
			productId: Number(productId),
			name: file.name,
			extension: extension,
			fileName: uniqueFilename,
			fileSize: file.size,
			mimeType: file.type,
			url: publicUrl,
			fileType: getFileType(file.type),
			...(file.type.startsWith("image/") ? { width: 0, height: 0 } : {}),
		});

		return c.json({
			success: true,
			data: {
				id: newFile.id,
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

function getFileType(mimeType: string): string {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType.startsWith("audio/")) return "audio";
	if (mimeType.includes("pdf")) return "pdf";
	if (mimeType.includes("zip") || mimeType.includes("compressed")) return "archive";
	return "other";
}

productRoute.get("/media/:productId", async (c) => {
	try {
		const productId = c.req.param("productId");
		if (!productId) {
			return c.json({ success: false, error: "Product ID is required" }, 400);
		}

		const db = database(c.env.DATABASE_URL);
		const dbImages = await getProductImages(db, Number(productId));
		const objects = await listBucketObjects(c, productId, "media");

		const dbUrls = new Set(dbImages.map((img) => img.url));
		
		const bucketItems = [];
		if (objects) {
			bucketItems.push(
				...objects.objects.map((obj: BucketObject) => {
					const prefix = `products/${productId}/media/`;
					const filename = obj.key.replace(prefix, "");
					return {
						filename,
						url: getAssetUrl(c, "media", productId, filename),
						size: obj.size,
						uploadedAt: obj.uploaded,
						sort: Number.parseInt(obj.customMetadata?.sort || "0"),
						metadata: obj.customMetadata,
					};
				}),
			);
		}

		const bucketOnlyItems = bucketItems.filter((item) => !dbUrls.has(item.url));

		const mediaItems = [
			...dbImages.map((img) => ({
				id: img.id,
				url: img.url,
				sort: img.sort,
				createdAt: img.createdAt,
			})),
			...bucketOnlyItems,
		].sort((a, b) => a.sort - b.sort);

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
			return c.json({ success: false, error: "Product not found" }, 404);
		}

		const dbFiles = await getProductFiles(db, Number(productId));
		const objects = await listBucketObjects(c, productId, "files");

		const dbFileNames = new Set(dbFiles.map((file) => file.fileName));
		
		const bucketItems = [];
		if (objects) {
			bucketItems.push(
				...objects.objects.map((obj) => {
					const prefix = `products/${productId}/files/`;
					const filename = obj.key.replace(prefix, "");
					return {
						filename,
						originalName: obj.customMetadata?.originalName,
						size: obj.size,
						uploadedAt: obj.uploaded,
						metadata: obj.customMetadata,
						url: getAssetUrl(c, "files", productId, filename),
					};
				}),
			);
		}

		const bucketOnlyItems = bucketItems.filter((item) => !dbFileNames.has(item.filename));

		const fileItems = [
			...dbFiles.map((file) => ({
				id: file.id,
				filename: file.fileName,
				originalName: file.name,
				extension: file.extension,
				size: file.fileSize,
				type: file.mimeType,
				url: file.url,
				createdAt: file.createdAt,
			})),
			...bucketOnlyItems,
		];

		return c.json({
			success: true,
			data: fileItems,
		});
	} catch (error) {
		return handleError(c, error, "Failed to get files");
	}
});

productRoute.delete(
	"/media/:productId/:filename",
	createValidator(productIdSchema, "param"),
	createValidator(filenameSchema, "param"),
	async (c) => {
		try {
			const productId = c.req.param("productId");
			const filename = c.req.param("filename");

			const bucketResult = await deleteBucketObject(c, productId, "media", filename);

			if (bucketResult.status === 200) {
				const db = database(c.env.DATABASE_URL);
				const url = getAssetUrl(c, "media", productId, filename);
				await deleteImageByUrl(db, url);
			}

			return bucketResult;
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

			const bucketResult = await deleteBucketObject(c, productId, "files", filename);

			if (bucketResult.status === 200) {
				const db = database(c.env.DATABASE_URL);
				await deleteFileByFileName(db, filename);
			}

			return bucketResult;
		} catch (error) {
			return handleError(c, error, "Failed to delete file");
		}
	},
);

productRoute.post("/temp/cleanup", AuthRoleMiddleware(["admin"]), async (c) => {
	try {
		const db = database(c.env.DATABASE_URL);

		const temporaryProducts = await db.select({ id: products.id })
			.from(products)
			.where(not(isNull(products.deletedAt)));

		if (!temporaryProducts || temporaryProducts.length === 0) {
			return c.json({
				success: true,
				data: { cleaned: 0, ids: [] },
				message: "No temporary products to clean up"
			});
		}

		const cleanedProductIds = [];
		
		for (const product of temporaryProducts) {
			try {
				const productId = String(product.id);

				const [mediaDeleted, filesDeleted] = await Promise.all([
					deleteBucketProductFiles(c, productId, "media"),
					deleteBucketProductFiles(c, productId, "files")
				]);

				if (mediaDeleted && filesDeleted) {
					const deleted = await deleteProduct(db, productId);
					if (deleted) {
						cleanedProductIds.push(productId);
					}
				}
			} catch (error) {
				console.error(`Error cleaning up product ${product.id}:`, error);
			}
		}

		return c.json({
			success: true,
			data: {
				cleaned: cleanedProductIds.length,
				ids: cleanedProductIds
			},
			message: `Cleaned up ${cleanedProductIds.length} temporary products`
		});
	} catch (error) {
		return handleError(c, error, "Failed to clean up temporary products");
	}
});

export default productRoute;
