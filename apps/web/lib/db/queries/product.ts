"use server";

import { db } from "@/lib/db";
import {
	categories,
	products,
	images,
	productTags,
	tags,
	type Product,
	type Category,
	type Image,
	type NewProduct,
} from "@apiaas/db/schema";
import { and, eq, ilike, sql, asc, desc, exists, ne, type SQL } from "drizzle-orm";
import type { ExtendedColumnSort, ExtendedColumnFilter } from "@/lib/utils/parsers";
import { slugify } from "@apiaas/utils";

export type ProductWithRelations = Pick<Product, "id" | "name" | "slug" | "locked" | "createdAt"> & {
	category: Pick<Category, "id" | "slug" | "name">;
	images: Pick<Image, "id" | "url" | "productId" | "sort">[];
};

export type CategoryWithProducts = Pick<Category, "id" | "name" | "slug" | "description"> & {
	productCount: number;
	freeProductCount: number;
	premiumProductCount: number;
	products: ProductWithRelations[];
	pagination: {
		total: number;
		perPage: number;
		page: number;
	};
};

// Define explicit interface for search parameters
export interface ProductSearchParams {
	name?: string;
	page?: string | number;
	perPage?: string | number;
	sort?: ExtendedColumnSort<Product>[];
	filters?: ExtendedColumnFilter<Product>[];
}

export async function getProductsByCategoryWithFilters(
	categorySlug: string,
	searchParams: ProductSearchParams,
): Promise<CategoryWithProducts | null> {
	// 1. Parse and validate search parameters with clean defaults
	const page = Number(searchParams.page) || 1;
	const perPage = Number(searchParams.perPage) || 12;
	const name = searchParams.name;

	// Parse JSON strings if they exist, otherwise use defaults
	const sort = (() => {
		try {
			return typeof searchParams.sort === "string"
				? JSON.parse(searchParams.sort)
				: Array.isArray(searchParams.sort)
					? searchParams.sort
					: [];
		} catch {
			return [];
		}
	})();

	const filters = (() => {
		try {
			return typeof searchParams.filters === "string"
				? JSON.parse(searchParams.filters)
				: Array.isArray(searchParams.filters)
					? searchParams.filters
					: [];
		} catch {
			return [];
		}
	})();

	// Calculate pagination values
	const offset = (page - 1) * perPage;

	// 2. Build query conditions
	const conditions: SQL<unknown>[] = [];

	// Add name filter (most common search case)
	if (name) {
		conditions.push(ilike(products.name, `%${name}%`));
	}

	// Process filter conditions
	if (Array.isArray(filters)) {
		for (const filter of filters) {
			if (!filter?.field || !filter?.operator) continue;

			const column = products[filter.field as keyof typeof products];
			if (!column || typeof column !== "object" || !("table" in column)) continue;

			// Get the column type from the schema
			const columnType = getColumnType(column);

			// Handle value based on column type
			if (filter.operator === "equals" && typeof filter.value === "string") {
				// For boolean columns, convert string to boolean
				if (columnType === "boolean") {
					conditions.push(eq(column, filter.value === "true"));
					continue;
				}
				conditions.push(eq(column, filter.value));
			} else if (filter.operator === "contains" && typeof filter.value === "string") {
				conditions.push(ilike(column, `%${filter.value}%`));
			} else if (filter.operator === "in" && Array.isArray(filter.value)) {
				conditions.push(sql`${column} = ANY(${filter.value}::text[])`);
			}
		}
	}

	// 3. Build sorting logic
	const orderBy = (() => {
		if (!Array.isArray(sort) || sort.length === 0) {
			return [desc(products.createdAt)]; // Default sort
		}

		const validSort = sort
			.filter((s) => s?.column && typeof s.column === "string")
			.map((s) => {
				const column = products[s.column as keyof typeof products];
				if (!column || typeof column !== "object" || !("table" in column)) return null;
				return s.desc ? desc(column) : asc(column);
			})
			.filter(Boolean) as SQL<unknown>[];

		return validSort.length > 0 ? validSort : [desc(products.createdAt)];
	})();

	// 4. Get the category
	const category = await db.query.categories.findFirst({
		where: eq(categories.slug, categorySlug),
		columns: {
			id: true,
			name: true,
			slug: true,
			description: true,
		},
	});

	if (!category) return null;

	// 5. Execute the queries in parallel for better performance
	const [counts, filteredCount, products_result] = await Promise.all([
		// Get product counts (without filters for category stats)
		db
			.select({
				count: sql<number>`count(products.id)`,
				freeCount: sql<number>`sum(case when not ${products.locked} then 1 else 0 end)`,
				premiumCount: sql<number>`sum(case when ${products.locked} then 1 else 0 end)`,
			})
			.from(products)
			.where(
				and(
					eq(products.categoryId, category.id),
					// Only apply name filter for counts - we don't apply locked filters
					// as this would affect the correct counting
					name ? ilike(products.name, `%${name}%`) : undefined,
				),
			)
			.then((rows) => rows[0]),

		// Get filtered count for pagination
		db
			.select({
				count: sql<number>`count(products.id)`,
			})
			.from(products)
			.where(and(eq(products.categoryId, category.id), ...conditions))
			.then((rows) => rows[0]?.count ?? 0),

		// Get the filtered products
		db.query.products.findMany({
			where: and(eq(products.categoryId, category.id), ...conditions),
			orderBy,
			limit: perPage,
			offset,
			columns: {
				id: true,
				name: true,
				slug: true,
				createdAt: true,
				locked: true,
			},
			with: {
				category: {
					columns: {
						id: true,
						slug: true,
						name: true,
					},
				},
				images: {
					columns: {
						id: true,
						url: true,
						productId: true,
						sort: true,
					},
				},
			},
		}),
	]);

	await new Promise((resolve) => setTimeout(resolve, 1000));

	// 6. Return the result
	return {
		...category,
		productCount: Number(counts?.count ?? 0),
		freeProductCount: Number(counts?.freeCount ?? 0),
		premiumProductCount: Number(counts?.premiumCount ?? 0),
		products: products_result as ProductWithRelations[],
		pagination: {
			total: Number(filteredCount ?? 0),
			perPage,
			page,
		},
	};
}

export async function getProductsByCategory(categorySlug: string) {
	const query = db.query.categories
		.findFirst({
			where: eq(categories.slug, sql.placeholder("categorySlug")),
			extras: {
				productCount: sql<number>`(
				SELECT COUNT(*) 
				FROM ${products} 
				WHERE products.category_id = ${categories.id}
			)`.as("productCount"),
			},
			columns: {
				id: true,
				name: true,
				slug: true,
				description: true,
			},
			with: {
				products: {
					columns: {
						id: true,
						name: true,
						slug: true,
						locked: true,
					},
					with: {
						category: {
							columns: {
								id: true,
								slug: true,
								name: true,
							},
						},
						images: {
							columns: {
								id: true,
								url: true,
								productId: true,
								sort: true,
							},
						},
					},
				},
			},
		})
		.prepare("get_product_by_category");

	const result = await query.execute({ categorySlug });
	return result;
}

export async function getProductBySlug(categorySlug: string, productSlug: string) {
	const result = await db.query.products
		.findFirst({
			columns: {
				id: true,
				slug: true,
				name: true,
				description: true,
				locked: true,
				updatedAt: true,
			},
			where: and(
				eq(products.slug, productSlug),
				exists(
					db
						.select()
						.from(categories)
						.where(and(eq(categories.slug, categorySlug), eq(categories.id, products.categoryId))),
				),
			),
			extras: {
				tags: sql<{ id: number; name: string; slug: string }[]>`
			COALESCE(
			  (
				SELECT json_agg(json_build_object(
				  'id', t.id,
				  'name', t.name,
				  'slug', t.slug
				))
				FROM ${tags} t
				JOIN ${productTags} pt ON pt.tag_id = t.id
				WHERE pt.product_id = ${products.id}
			  ),
			  '[]'::json
			)
		  `.as("tags"),
			},
			with: {
				files: {
					columns: {
						extension: true,
					},
				},
				images: {
					columns: {
						id: true,
						sort: true,
						url: true,
					},
				},
				category: {
					columns: {
						id: true,
						slug: true,
						name: true,
					},
				},
			},
		});
	return result;
}

export async function getRelatedProducts(categoryId: number, currentProductId: number, limit = 4) {
	const relatedProductsQuery = db
		.select({
			id: products.id,
			name: products.name,
			slug: products.slug,
			thumbnail: images.url,
			locked: products.locked,
		})
		.from(products)
		.where(
			and(eq(products.categoryId, sql.placeholder("categoryId")), ne(products.id, sql.placeholder("currentProductId"))),
		)
		.leftJoin(images, and(eq(images.productId, products.id), eq(images.sort, 0)))
		.limit(sql.placeholder("limit"))
		.prepare("get_related_products");

	return relatedProductsQuery.execute({
		categoryId,
		currentProductId,
		limit,
	});
}

function getColumnType(column: unknown): string | null {
	if (column && typeof column === "object" && "dataType" in column) {
		const dataType = (column as { dataType?: string }).dataType;
		return dataType?.toLowerCase() || null;
	}

	const columnStr = String(column);
	if (columnStr.includes("boolean(")) {
		return "boolean";
	}

	return null;
}

export async function getProductById(productId: number) {
	const product = await db.query.products.findFirst({
		where: eq(products.id, productId),
	});
	return product;
}

export async function syncProduct(productId: number, product: NewProduct) {
	const [updatedProduct] = await db
		.update(products)
		.set({
			name: product.name,
			slug: product.slug,
			price: product.price,
			locked: product.locked,
			description: product.description,
			categoryId: product.categoryId,
		})
		.where(eq(products.id, productId))
		.returning({
			id: products.id,
			name: products.name,
			slug: products.slug,
			price: products.price,
			locked: products.locked,
			description: products.description,
			categoryId: products.categoryId,
		});

	return updatedProduct;
}

export async function generateProductSlug(name: string) {
	const slug = slugify(name);

	const existingProduct = await db.query.products.findFirst({
		where: eq(products.slug, slug),
	});

	if (existingProduct) {
		return generateProductSlug(`${name}-${existingProduct.id}`);
	}

	return slug;
}
