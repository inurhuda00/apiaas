import { eq, type Database } from "@apiaas/db";
import { images } from "@apiaas/db/schema";
import type { NewImage } from "@apiaas/db/schema";

/**
 * Create a new image record in the database
 *
 * @param db Database instance
 * @param image Image data to insert
 * @returns The newly created image
 */
export async function createImage(db: Database, image: NewImage) {
	const [newImage] = await db
		.insert(images)
		.values({
			productId: image.productId,
			url: image.url,
			sort: image.sort,
		})
		.returning({
			id: images.id,
			productId: images.productId,
			url: images.url,
			sort: images.sort,
			createdAt: images.createdAt,
		});

	return newImage;
}

/**
 * Get all images for a product
 *
 * @param db Database instance
 * @param productId Product ID
 * @returns Array of images
 */
export async function getProductImages(db: Database, productId: number) {
	const productImages = await db.query.images.findMany({
		where: eq(images.productId, productId),
		orderBy: (images, { asc }) => [asc(images.sort)],
	});

	return productImages;
}

/**
 * Delete an image by URL
 *
 * @param db Database instance
 * @param url Image URL to delete
 * @returns Boolean indicating if the deletion was successful
 */
export async function deleteImageByUrl(db: Database, url: string) {
	try {
		const [deletedImage] = await db.delete(images).where(eq(images.url, url)).returning({ id: images.id });

		return !!deletedImage;
	} catch (error) {
		console.error("Error deleting image:", error);
		return false;
	}
}
