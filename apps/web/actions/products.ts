"use server";

import { generateProductSlug, getProductById, syncProduct } from "@/lib/db/queries/product";
import { validatedActionWithUser } from "./middleware";
import { UpdateProductSchema } from "./products.validation";
import { getCategoryById } from "@/lib/db/queries/category";
import { redirect } from "next/navigation";

export const updateProduct = validatedActionWithUser(UpdateProductSchema, async (data, formData, user) => {
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
