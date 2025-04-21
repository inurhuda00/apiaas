import { Hono } from "hono";
import type { Env, Variables } from "@/types";
import { database } from "@apiaas/db";
import { products, categories, images } from "@apiaas/db/schema";
import { handleError } from "../helpers/error";
import { eq, like, and, asc, desc, sql, isNull } from "drizzle-orm";

// Create a new router for search endpoints
const searchRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

// Product search endpoint
searchRoute.get("/products", async (c) => {
	try {
		const query = c.req.query("query") || "";

		if (!query || query.length < 2) {
			return c.json({ success: false, error: "Search query must be at least 2 characters" }, 400);
		}

		const db = database(c.env.DATABASE_URL);

		// Search for products by name
		const searchResults = await db
			.select({
				id: products.id,
				name: products.name,
				slug: products.slug,
				locked: products.locked,
				categoryId: products.categoryId,
				categoryName: categories.name,
				categorySlug: categories.slug,
				// Select the first image for each product
				imageUrl: sql<string>`(
          SELECT url FROM images 
          WHERE images.product_id = products.id 
          ORDER BY images.sort ASC 
          LIMIT 1
        )`,
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			.where(and(like(products.name, `%${query}%`), isNull(products.deletedAt)))
			.orderBy(asc(products.name))
			.limit(10);

		return c.json({
			success: true,
			data: searchResults,
		});
	} catch (error) {
		return handleError(c, error, "Failed to search products");
	}
});

export { searchRoute };
