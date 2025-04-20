"use server";

import { generateProductSlug, getProductById, syncProduct } from "@/lib/db/queries/product";
import { validatedActionWithUser } from "./middleware";
import { DeleteProductSchema, UpdateProductSchema } from "./products.validation";
import { getCategoryById } from "@/lib/db/queries/category";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth/session";
import { env } from "@/env";

export const updateProduct = validatedActionWithUser(UpdateProductSchema, async (data, _, user) => {
	if (!user.role.includes("admin")) {
		return {
			...data,
			error: "You are not authorized to create products",
		};
	}
	const { productId, categoryId, locked, price, ...rest } = data;

	const existingProduct = await getProductById(Number(productId));

	if (!existingProduct) {
		return {
			...rest,
			error: "Product not found",
		};
	}

	const category = await getCategoryById(Number(categoryId));

	if (!category) {
		return {
			...rest,
			error: "Category not found",
		};
	}

	const slug = await generateProductSlug(rest.name);

	await syncProduct(existingProduct.id, {
		...rest,
		categoryId: Number(categoryId),
		ownerId: user.id,
		locked: locked ?? true,
		price: price ?? 0,
		slug,
	});

	return redirect("/files");
});

export const deleteProduct = validatedActionWithUser(DeleteProductSchema, async (data, _, user) => {
	const { productId } = data;

	const token = await getAccessToken();
	if (!token) {
		return { error: "Authentication failed. Please log in again." };
	}

	try {
		const response = await fetch(`${env.BACKEND_URL}/v1/product/${productId}/cleanup`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ _authorization: token }),
		});
		
		const result = await response.json();
		
		if (result.success) {
			return { success: "Product and associated files deleted successfully" };
		}
		
		console.error("API error response:", result.error);
		return { error: result.error || "Failed to delete product" };
	} catch (error) {
		console.error("API error:", error);
		return { error: "An error occurred while deleting the product" };
	}
});
