import { eq, type Database } from "@apiaas/db";
import { products } from "@apiaas/db/schema";
import type { NewProduct } from "@apiaas/db/schema";
import { slugify } from "@apiaas/utils";

export async function getProduct(db: Database, productId: string) {
	const product = await db.query.products.findFirst({
		where: eq(products.id, Number(productId)),
	});

	return product;
}

export async function createProduct(db: Database, product: NewProduct) {
	const [newProduct] = await db
		.insert(products)
		.values({
			name: product.name,
			slug: product.slug,
			description: product.description,
			categoryId: product.categoryId,
			ownerId: product.ownerId,
			price: product.price,
			locked: product.locked,
		})
		.returning({
			id: products.id,
			name: products.name,
			slug: products.slug,
			description: products.description,
			categoryId: products.categoryId,
			ownerId: products.ownerId,
		});

	return newProduct;
}

export async function generateProductSlug(db: Database, name: string) {
	const slug = slugify(name);

	const existingProduct = await db.query.products.findFirst({
		where: eq(products.slug, slug),
	});

	if (existingProduct) {
		return generateProductSlug(db, `${name}-${existingProduct.id}`);
	}

	return slug;
}
