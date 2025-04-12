import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const imageRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware autentikasi hanya untuk admin
imageRoute.use("/*", AuthRoleMiddleware(["admin"]));

// Schema untuk form upload
const uploadSchema = z.object({
	file: z.instanceof(File, { message: "File is required" }),
	title: z.string().min(1, "Title is required").max(100, "Title is too long"),
	description: z.string().optional(),
});

// Schema untuk delete
const deleteSchema = z.object({
	filename: z.string().min(1, { message: "Filename is required" }),
});

// Generate unique filename
const generateUniqueFilename = (originalName: string) => {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 10);
	const ext = originalName.split(".").pop();
	return `${timestamp}-${randomString}.${ext}`;
};

// Validate mime type
const validateMimeType = (file: File) => {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	];

	if (!allowedMimeTypes.includes(file.type)) {
		throw new Error(
			`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
		);
	}
};

// Route untuk upload image
imageRoute.post(
	"/upload",
	zValidator("form", uploadSchema, (result, c) => {
		if (!result.success) {
			return c.json(
				{
					success: false,
					error: result.error.format(),
				},
				400,
			);
		}
	}),
	async (c) => {
		try {
			// Get form data
			const data = await c.req.valid("form");
			const file = data.file;
			const title = data.title;
			const description = data.description || "";

			// Validate mime type
			try {
				validateMimeType(file);
			} catch (err) {
				return c.json(
					{
						success: false,
						error: err instanceof Error ? err.message : "Invalid file type",
					},
					400,
				);
			}

			// Generate unique filename
			const uniqueFilename = generateUniqueFilename(file.name);

			// Get user from context
			const user = c.get("user");

			// Upload to R2
			await c.env.BUCKET.put(uniqueFilename, file, {
				httpMetadata: {
					contentType: file.type,
				},
				customMetadata: {
					userId: user.id.toString(),
					title,
					description,
					originalName: file.name,
					uploadedAt: new Date().toISOString(),
				},
			});

			// Generate public URL
			const publicUrl = `https://cdn.mondive.xyz/${uniqueFilename}`;

			return c.json({
				success: true,
				data: {
					url: publicUrl,
					filename: uniqueFilename,
					title,
					description,
					size: file.size,
					type: file.type,
				},
			});
		} catch (error) {
			console.error("Upload error:", error);
			return c.json(
				{
					success: false,
					error:
						error instanceof Error ? error.message : "Failed to upload image",
				},
				500,
			);
		}
	},
);

// Route untuk mendapatkan daftar image
imageRoute.get("/", async (c) => {
	const user = c.get("user");

	// List objects from R2 bucket
	const objects = await c.env.BUCKET.list();

	// Filter dan format objek untuk response
	const images = objects.objects.map((obj) => {
		return {
			url: `https://cdn.mondive.xyz/${obj.key}`,
			filename: obj.key,
			size: obj.size,
			uploadedAt: obj.uploaded,
			metadata: obj.customMetadata,
		};
	});

	return c.json({
		success: true,
		data: images,
	});
});

// Route untuk mendapatkan detail image
imageRoute.get("/:filename", async (c) => {
	try {
		const filename = c.req.param("filename");

		if (!filename) {
			return c.json(
				{
					success: false,
					error: "Filename is required",
				},
				400,
			);
		}

		// Get object and its metadata
		const object = await c.env.BUCKET.head(filename);

		if (!object) {
			return c.json(
				{
					success: false,
					error: "File not found",
				},
				404,
			);
		}

		// Generate public URL
		const publicUrl = `https://cdn.mondive.xyz/${filename}`;

		return c.json({
			success: true,
			data: {
				url: publicUrl,
				filename,
				size: object.size,
				uploaded: object.uploaded,
				etag: object.etag,
				httpMetadata: object.httpMetadata,
				customMetadata: object.customMetadata,
			},
		});
	} catch (error) {
		console.error("Get image error:", error);
		return c.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to get image",
			},
			500,
		);
	}
});

// Route untuk menghapus image
imageRoute.delete("/:filename", async (c) => {
	try {
		const filename = c.req.param("filename");

		if (!filename) {
			return c.json(
				{
					success: false,
					error: "Filename is required",
				},
				400,
			);
		}

		// Check if file exists
		const object = await c.env.BUCKET.head(filename);

		if (!object) {
			return c.json(
				{
					success: false,
					error: "File not found",
				},
				404,
			);
		}

		// Delete from R2
		await c.env.BUCKET.delete(filename);

		return c.json({
			success: true,
			message: "File deleted successfully",
			filename,
		});
	} catch (error) {
		console.error("Delete error:", error);
		return c.json(
			{
				success: false,
				error:
					error instanceof Error ? error.message : "Failed to delete image",
			},
			500,
		);
	}
});

export default imageRoute;
