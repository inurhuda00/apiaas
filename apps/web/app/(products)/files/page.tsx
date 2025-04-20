import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, type Product } from "@apiaas/db/schema";
import { desc, and, sql, type SQL } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { Pagination } from "@/components/pagination";
import { searchParamsCache } from "@/lib/utils/parsers";
import type { SearchParams } from "next/dist/server/request/search-params";
import { ProductsGrid } from "./_components/products-grid";

export const metadata = {
	title: "My Files",
	description: "Manage your uploaded files",
};

interface PageProps {
	searchParams: Promise<SearchParams>;
}

const ITEMS_PER_PAGE = 12;

export default async function FilesPage(props: PageProps) {
	const searchParams = await props.searchParams;
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/sign-in");
	}

	const search = searchParamsCache<Product>(
		{
			column: "createdAt" as keyof Product,
			desc: true,
		},
		ITEMS_PER_PAGE,
	).parse(searchParams);

	const { page, perPage, name } = search;
	const offset = (page - 1) * perPage;

	// Build conditions for product search
	const conditions: SQL<unknown>[] = [];

	// Add name filter if provided
	if (name) {
		conditions.push(sql`${products.name} ILIKE ${`%${name}%`}`);
	}

	// Use cache for better performance
	const productsCacheFunction = async () => {
		// Get total count of user products with filters applied
		const totalCountResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(products)
			.where(and(...conditions))
			.then((rows: { count: number }[]) => rows[0]?.count ?? 0);

		const userProducts = await db.query.products.findMany({
			where: and(...conditions),
			orderBy: desc(products.createdAt),
			limit: perPage,
			offset,
			with: {
				owner: true,
				images: true,
				files: true,
				category: true,
			},
		});

		return {
			products: userProducts,
			pagination: {
				total: Number(totalCountResult),
				perPage,
				page,
			},
		};
	};

	const { products: userProducts, pagination } = await productsCacheFunction();

	const totalPages = Math.ceil(pagination.total / perPage);

	return (
		<main>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold">My Products and Files</h1>
					<p className="text-muted-foreground mt-1">Manage your products and uploaded files</p>
				</div>
				<Link href="/upload" className={buttonVariants()}>
					<Icons.FileUpload className="h-4 w-4 mr-2" />
					Upload New File
				</Link>
			</div>

			{/* Search input */}
			<div className="mb-6">
				<form className="relative max-w-sm">
					<Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<input
						type="search"
						name="name"
						defaultValue={name ?? ""}
						placeholder="Search products..."
						className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
					/>
				</form>
			</div>

			{userProducts.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>No products found</CardTitle>
						<CardDescription>You haven't created any products yet</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-center py-8 text-muted-foreground">Get started by creating your first product</p>
					</CardContent>
				</Card>
			) : (
				<>
					<ProductsGrid products={userProducts} />

					{/* Pagination */}
					{totalPages > 1 && (
						<Pagination pageCount={totalPages} currentPage={page} baseUrl="/files" searchParams={searchParams} />
					)}
				</>
			)}
		</main>
	);
}
