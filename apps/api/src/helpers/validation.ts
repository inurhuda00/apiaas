import { transformZodError } from "@apiaas/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const createValidator = (schema: z.ZodSchema, type: "json" | "form" | "param" | "query" = "json") => {
	return zValidator(type, schema, (result, c) => {
		if (!result.success) {
			const error = transformZodError(result.error);
			return c.json(error, 422);
		}
	});
};

export const productSchema = z.object({
	name: z.string().min(1, { message: "Product name is required" }),
	description: z.string().optional(),
});

export const mediaUploadSchema = z.object({
	productId: z.string().min(1, { message: "Product ID is required" }),
	file: z.instanceof(File, { message: "File is required" }).refine(
		(file) => {
			const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
			return allowedMimeTypes.includes(file.type);
		},
		{
			message: "Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.",
		},
	),
	isPrimary: z.preprocess((val) => val === "true" || val === true, z.boolean().optional().default(false)),
});

export const fileUploadSchema = z.object({
	productId: z.string().min(1, { message: "Product ID is required" }),
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
			message: "Invalid file type. Only PDF, ZIP, SVG, and vector files are allowed.",
		},
	),
});

export const productIdSchema = z.object({
	productId: z.string().min(1, { message: "Product ID is required" }),
});

export const filenameSchema = z.object({
	filename: z.string().min(1, { message: "Filename is required" }),
});

export const AuthorizationBeaconSchema = z.object({
	_authorization: z.string().min(1, { message: "Authorization is required" }),
});
