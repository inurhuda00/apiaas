import { z } from "zod";

export const UpdateProductSchema = z.object({
	productId: z.string().min(1, "Please provide a valid product ID"),
	name: z.string().min(1, "Please enter a product name"),
	description: z.string().optional(),
	price: z.coerce.number().min(0, "Price cannot be negative").optional(),
	categoryId: z.string().min(1, "Please select a category"),
	locked: z.boolean().optional(),
});

export const DownloadProductSchema = z.object({
	productId: z.number().min(1, "Please provide a valid product ID to download"),
});
