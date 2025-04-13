import { z } from "zod";

export const UploadImageSchema = z.object({
	file: z
		.instanceof(File)
		.refine((file) => file.type.startsWith("image/"), "File must be an image")
		.refine(
			(file) => file.size <= 5 * 1024 * 1024,
			"Image must be less than 5MB",
		),
});
