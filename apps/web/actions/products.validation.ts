import { z } from "zod";

export const UpdateProductSchema = z.object({
	productId: z.number().min(1, "Product ID is required"),
	name: z.string().min(1, "Product name is required"),
	description: z.string().optional(),
	price: z.coerce.number().min(0, "Price must be a positive number").optional(),
	categoryId: z.number().min(1, "Category is required"),
	locked: z.boolean().optional(),
});
