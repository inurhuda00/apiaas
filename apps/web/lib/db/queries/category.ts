import { eq } from "drizzle-orm";
import { categories } from "@apiaas/db/schema";
import { db } from "..";

export async function getCategoryById(id: number) {
	const category = await db.query.categories.findFirst({
		where: eq(categories.id, id),
	});
	return category;
}
