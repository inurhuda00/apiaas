import { z } from "zod";

export const UploadAssetsSchema = z.object({
	images: z
		.array(z.instanceof(File))
		.min(1, "At least one image is required")
		.max(10, "Maximum of 10 images allowed")
		.refine(
			(files) => files.every((file) => file.type.startsWith("image/")),
			"All files must be images",
		)
		.refine(
			(files) => files.every((file) => file.size <= 5 * 1024 * 1024),
			"Each image must be less than 5MB",
		),
});
