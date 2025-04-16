"use server";

import {
	generateProductSlug,
	getProductById,
	syncProduct,
} from "@/lib/db/queries/product";
import { validatedActionWithUser } from "./middleware";
import { UpdateProductSchema } from "./products.validation";
import { getCategoryById } from "@/lib/db/queries/category";

export const updateProduct = validatedActionWithUser(
	UpdateProductSchema,
	async (data, formData, user) => {
		if (!user.role.includes("admin")) {
			return {
				...data,
				error: "You are not authorized to create products",
			};
		}
		console.log(formData);

		const { productId, categoryId, locked, price, ...rest } = data;

		const existingProduct = await getProductById(productId);

		if (!existingProduct) {
			return {
				...rest,
				error: "Product not found",
			};
		}

		const category = await getCategoryById(categoryId);

		if (!category) {
			return {
				...rest,
				error: "Category not found",
			};
		}

		const slug = await generateProductSlug(rest.name);

		const updatedProduct = await syncProduct(existingProduct.id, {
			...rest,
			categoryId: categoryId,
			ownerId: user.id,
			locked: locked ?? true,
			price: price ?? 0,
			slug,
		});

		return {
			...updatedProduct,
		};
	},
);
