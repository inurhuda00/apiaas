import { z } from "zod";

export const CreateProductSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	description: z.string().optional(),
	price: z.coerce.number().min(0, "Price must be a positive number").optional(),
	category: z.string().min(1, "Category is required").optional(),
});
