import { eq, type Database } from "@apiaas/db";
import { files, images, products, productTags } from "@apiaas/db/schema";
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
			deletedAt: new Date(),
		})
		.returning({
			id: products.id,
			name: products.name,
			slug: products.slug,
			description: products.description,
			categoryId: products.categoryId,
			ownerId: products.ownerId,
			deletedAt: products.deletedAt,
		});

	return newProduct;
}

export async function restoreProduct(db: Database, productId: number) {
	const [restoredProduct] = await db
		.update(products)
		.set({
			deletedAt: null,
		})
		.where(eq(products.id, productId))
		.returning({ id: products.id });

	return !!restoredProduct;
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
export async function deleteProduct(db: Database, productId: string) {
	try {
		const productIdNum = Number(productId);

		await db.delete(images).where(eq(images.productId, productIdNum));

		await db.delete(files).where(eq(files.productId, productIdNum));

		await db.delete(productTags).where(eq(productTags.productId, productIdNum));

		const [deletedProduct] = await db
			.delete(products)
			.where(eq(products.id, productIdNum))
			.returning({ id: products.id });

		return !!deletedProduct;
	} catch (error) {
		console.error("Error deleting product:", error);
		return false;
	}
}
