import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
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

// Helper function to generate dynamic asset URLs
function getAssetUrl(c: { env: Env }, type: 'media' | 'files', productId: string, filename: string): string {
	const assetDomain = c.env.ASSET_DOMAIN || 'assets.mondive.xyz';
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
		const { file, productId, sort } = data;
		const user = c.get("user");

		const uniqueFilename = await uploadToBucket(c, file, productId, "media", {
			userId: user.id.toString(),
			productId: productId.toString(),
			sort: sort.toString(),
		});

		const publicUrl = getAssetUrl(c, 'media', productId, uniqueFilename);

		// Save image metadata to database
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
		const data = await c.req.valid("form");
		const { file, productId } = data;
		const user = c.get("user");

		const uniqueFilename = await uploadToBucket(c, file, productId, "files", {
			userId: user.id.toString(),
			productId: productId.toString(),
		});

		const publicUrl = getAssetUrl(c, 'files', productId, uniqueFilename);
		
		// Extract file extension
		const extension = file.name.split('.').pop() || '';
		
		// Save file metadata to database
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
			// Add image dimensions if it's an image
			...(file.type.startsWith('image/') ? { width: 0, height: 0 } : {}),
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

// Helper function to determine file type from mime type
function getFileType(mimeType: string): string {
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	if (mimeType.includes('pdf')) return 'pdf';
	if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
	return 'other';
}

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

		// Get images from database
		const db = database(c.env.DATABASE_URL);
		const dbImages = await getProductImages(db, Number(productId));
		
		// Also get objects from bucket for backward compatibility
		const objects = await listBucketObjects(c, productId, "media");
		
		interface BucketItem {
			filename: string;
			url: string;
			size: number;
			uploadedAt: string;
			sort: number;
			metadata?: Record<string, string>;
		}
		
		const bucketItems: BucketItem[] = [];

		if (objects) {
			interface BucketObject {
				key: string;
				size: number;
				uploaded: string;
				customMetadata?: Record<string, string>;
			}

			bucketItems.push(...objects.objects.map((obj: BucketObject) => {
				const prefix = `products/${productId}/media/`;
				const filename = obj.key.replace(prefix, "");
				return {
					filename,
					url: getAssetUrl(c, 'media', productId, filename),
					size: obj.size,
					uploadedAt: obj.uploaded,
					sort: Number.parseInt(obj.customMetadata?.sort || "0"),
					metadata: obj.customMetadata,
				};
			}));
		}

		// Create merged list with database images taking precedence
		const dbUrls = new Set(dbImages.map(img => img.url));
		
		// Keep bucket items that aren't in the database
		const bucketOnlyItems = bucketItems.filter(item => !dbUrls.has(item.url));
		
		// Merge the lists and sort by sort order
		const mediaItems = [
			...dbImages.map(img => ({
				id: img.id,
				url: img.url,
				sort: img.sort,
				createdAt: img.createdAt,
			})),
			...bucketOnlyItems
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
			return c.json(
				{
					success: false,
					error: "Product not found",
				},
				404,
			);
		}

		// Get files from database
		const dbFiles = await getProductFiles(db, Number(productId));
		
		// Also get objects from bucket for backward compatibility
		const objects = await listBucketObjects(c, productId, "files");
		
		interface BucketItem {
			filename: string;
			originalName?: string;
			size: number;
			uploadedAt: string;
			metadata?: Record<string, string>;
			url: string;
		}
		
		const bucketItems: BucketItem[] = [];

		if (objects) {
			interface BucketObject {
				key: string;
				size: number;
				uploaded: string;
				customMetadata?: Record<string, string>;
			}

			bucketItems.push(...objects.objects.map((obj: BucketObject) => {
				const prefix = `products/${productId}/files/`;
				const filename = obj.key.replace(prefix, "");
				return {
					filename,
					originalName: obj.customMetadata?.originalName,
					size: obj.size,
					uploadedAt: obj.uploaded,
					metadata: obj.customMetadata,
					url: getAssetUrl(c, 'files', productId, filename)
				};
			}));
		}

		// Create merged list with database files taking precedence
		const dbFileNames = new Set(dbFiles.map(file => file.fileName));
		
		// Keep bucket items that aren't in the database
		const bucketOnlyItems = bucketItems.filter(item => !dbFileNames.has(item.filename));
		
		// Merge the lists
		const fileItems = [
			...dbFiles.map(file => ({
				id: file.id,
				filename: file.fileName,
				originalName: file.name,
				extension: file.extension,
				size: file.fileSize,
				type: file.mimeType,
				url: file.url,
				createdAt: file.createdAt,
			})),
			...bucketOnlyItems
		];

		return c.json({
			success: true,
			data: fileItems,
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

			if (!file) {
				throw new Error("File not found");
			}

			const headers = new Headers();
			file.writeHttpMetadata(headers);
			headers.set("etag", file.httpEtag);
			headers.set("Content-Type", file.httpMetadata?.contentType || "application/octet-stream");
			headers.set("Content-Disposition", `attachment; filename="${filename}"`);
			headers.set("Content-Length", file.size.toString());
			headers.set("Content-Transfer-Encoding", "binary");
			headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
			headers.set("Pragma", "no-cache");
			headers.set("Expires", "0");

			return new Response(file.body, {
				headers,
			});
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
			
			// Delete from bucket
			const bucketResult = await deleteBucketObject(c, productId, "media", filename);
			
			// Delete from database if file exists in bucket
			if (bucketResult.status === 200) {
				const db = database(c.env.DATABASE_URL);
				const url = getAssetUrl(c, 'media', productId, filename);
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
			
			// Delete from bucket
			const bucketResult = await deleteBucketObject(c, productId, "files", filename);
			
			// Delete from database if file exists in bucket
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

export default productRoute;
