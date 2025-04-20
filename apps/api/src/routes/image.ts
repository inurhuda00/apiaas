import { Hono } from "hono";
import { AuthRoleMiddleware } from "../middleware/auth";
import type { Env, Variables } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const imageRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

imageRoute.use("/*", AuthRoleMiddleware(["admin"]));

const uploadSchema = z.object({
	file: z.instanceof(File, { message: "File is required" }),
});

const deleteSchema = z.object({
	filename: z.string().min(1, { message: "Filename is required" }),
});

const generateUniqueFilename = (originalName: string) => {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 10);
	const ext = originalName.split(".").pop();
	return `${timestamp}-${randomString}.${ext}`;
};

const validateMimeType = (file: File) => {
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

	if (!allowedMimeTypes.includes(file.type)) {
		throw new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`);
	}
};

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
			const data = await c.req.valid("form");
			const file = data.file;

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

			const uniqueFilename = generateUniqueFilename(file.name);

			const user = c.get("user");

			await c.env.BUCKET.put(uniqueFilename, file, {
				httpMetadata: {
					contentType: file.type,
				},
				customMetadata: {
					userId: String(user.id),
					originalName: file.name,
					uploadedAt: new Date().toISOString(),
				},
			});

			const publicUrl = `https://assets.mondive.xyz/${uniqueFilename}`;

			return c.json({
				success: true,
				data: {
					url: publicUrl,
					filename: uniqueFilename,
					size: file.size,
					type: file.type,
				},
			});
		} catch (error) {
			console.error("Upload error:", error);
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Failed to upload image",
				},
				500,
			);
		}
	},
);

imageRoute.get("/", async (c) => {
	const user = c.get("user");

	const objects = await c.env.BUCKET.list();

	const images = objects.objects.map((obj) => {
		return {
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

		const publicUrl = `https://assets.mondive.xyz/${filename}`;

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
				error: error instanceof Error ? error.message : "Failed to delete image",
			},
			500,
		);
	}
});

export default imageRoute;
