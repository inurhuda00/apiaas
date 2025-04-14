"use server";

import { makeProduct } from "@/lib/db/queries/product";
import { validatedActionWithUser } from "./middleware";
import { CreateProductSchema } from "./products.validation";
import { slugify } from "@/lib/utils/slugify";

export const createProduct = validatedActionWithUser(
	CreateProductSchema,
	async (data, _, user) => {
		if (!user.role.includes("admin")) {
			return {
				error: "You are not authorized to create products",
			};
		}

		const { name, description } = data;

		const product = await makeProduct({
			name,
			description,
			ownerId: user.id,
			categoryId: 1,
			slug: slugify(name),
		});

		return {
			product,
		};
	},
);
