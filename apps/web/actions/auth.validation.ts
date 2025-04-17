import { z } from "zod";

export const signInSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.min(3, "Email must be at least 3 characters")
		.max(255, "Email cannot exceed 255 characters"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password cannot exceed 100 characters"),
});

export const signUpSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email("Please enter a valid email address")
		.min(3, "Email must be at least 3 characters")
		.max(255, "Email cannot exceed 255 characters"),
	password: z
		.string({ required_error: "Password is required" })
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password cannot exceed 100 characters"),
	licenseKey: z.string({ required_error: "License key is required" }).min(1, "License key cannot be empty"),
});

export const signOutSchema = z.object({});

export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.email("Please enter a valid email address")
		.min(3, "Email must be at least 3 characters")
		.max(255, "Email cannot exceed 255 characters"),
});

export const updatePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, "Current password must be at least 8 characters")
			.max(100, "Current password cannot exceed 100 characters"),
		newPassword: z
			.string()
			.min(8, "New password must be at least 8 characters")
			.max(100, "New password cannot exceed 100 characters"),
		confirmPassword: z
			.string()
			.min(8, "Confirm password must be at least 8 characters")
			.max(100, "Confirm password cannot exceed 100 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const deleteAccountSchema = z.object({
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100, "Password cannot exceed 100 characters"),
});

export const updateAccountSchema = z.object({
	name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
});
