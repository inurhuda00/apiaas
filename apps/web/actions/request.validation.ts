import { z } from "zod";

export const requestSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	description: z.string().min(10, "Please provide a detailed description (at least 10 characters)"),
});
