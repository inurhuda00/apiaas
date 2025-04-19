import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products, type Product } from "@apiaas/db/schema";
import { desc, and, sql, type SQL } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { Pagination } from "@/components/pagination";
import { searchParamsCache } from "@/lib/utils/parsers";
import type { SearchParams } from "next/dist/server/request/search-params";

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
		ITEMS_PER_PAGE
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
			}
		});

		return {
			products: userProducts,
			pagination: {
				total: Number(totalCountResult),
				perPage,
				page,
			}
		};
	};

	const { products: userProducts, pagination } = await productsCacheFunction();

	const totalPages = Math.ceil(pagination.total / perPage);

	const isImage = (fileType: string) => fileType.startsWith("image/");

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
					<div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
						{userProducts.map((product) => (
							<Card key={product.id} className="overflow-hidden flex flex-col">
								<div className="aspect-square bg-muted relative">
									{product.images && product.images.length > 0 ? (
										<div className="w-full h-full relative overflow-hidden">
											<img 
												src={product.images[0].url} 
												alt={product.name} 
												className="w-full h-full object-contain" 
											/>
										</div>
									) : (
										<div className="flex items-center justify-center h-full">
											<Icons.Inventory className="h-16 w-16 text-muted-foreground opacity-30" />
										</div>
									)}
								</div>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg truncate" title={product.name}>
										{product.name}
									</CardTitle>
									<CardDescription>
										{formatDistanceToNow(new Date(product.createdAt), {
											addSuffix: true,
										})}
									</CardDescription>
								</CardHeader>
								<CardContent className="pb-4 pt-0 flex-grow">
									<div className="text-xs text-muted-foreground mt-auto">
										<p className="flex items-center gap-1">
											<Icons.Description className="h-3 w-3" />
											<span>
												{product.files ? product.files.length : 0} Files
											</span>
										</p>
									</div>
								</CardContent>
								<div className="px-6 pb-4 pt-0">
									<div className="flex space-x-2">
										<Button asChild variant="outline" size="sm" className="flex-1">
											<Link href={`/${product.category.slug}/${product.slug}`} className="flex items-center justify-center">
												<Icons.ExternalLink className="h-4 w-4 mr-2" />
												View Product
											</Link>
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<Pagination
							pageCount={totalPages}
							currentPage={page}
							baseUrl="/files"
							searchParams={searchParams}
						/>
					)}
				</>
			)}
		</main>
	);
}
