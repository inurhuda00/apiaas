import { getProductsByCategoryWithFilters } from "@/lib/db/queries/product";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { notFound } from "next/navigation";
import { searchParamsCache } from "@/lib/utils/parsers";
import type { Product } from "@apiaas/db/schema";
import type { SearchParams } from "next/dist/server/request/search-params";
import { useDataControls } from "@/lib/hooks/useDataControls";
import { DynamicDataControls, DynamicPaginate, DynamicProductCard } from "@/components/lazy-components";
import { unstable_cache as cache } from "next/cache";
import { generateSearchCacheKey } from "@/lib/utils/generate-cache-key";
import { ProductGridSkeleton } from "@/components/skeletons/product-grid-skeleton";
import { Suspense } from "react";
import { Icons } from "@/components/ui/icons";

interface PageProps {
	params: Promise<{
		category: string;
	}>;
	searchParams: Promise<SearchParams>;
}

const ITEMS_PER_PAGE = 6;

async function CategoryPage(props: PageProps) {
	const { category: param } = await props.params;
	const searchParams = await props.searchParams;

	const search = searchParamsCache<Product>(
		{
			column: "createdAt",
			desc: true,
		},
		ITEMS_PER_PAGE,
	).parse(searchParams);

	const categoryCache = cache(
		async () => await getProductsByCategoryWithFilters(param, search),
		["category", param, generateSearchCacheKey(search)],
	);

	const category = await categoryCache();

	if (!category) notFound();

	const totalPages = Math.ceil(category.pagination.total / ITEMS_PER_PAGE);
	const currentPage = search.page;

	const filterOptions = [
		{
			key: "all",
			field: "all",
			operator: "equals",
			value: "true",
			label: "All",
			count: category.productCount,
		},
		{
			key: "free",
			field: "locked",
			operator: "equals",
			value: "false",
			label: "Free",
			count: category.freeProductCount,
		},
		{
			key: "premium",
			field: "locked",
			operator: "equals",
			value: "true",
			label: "Premium",
			count: category.premiumProductCount,
		},
	];

	// Define sort options for the UI
	const sortOptions = [
		{
			key: "newest",
			column: "createdAt",
			desc: true,
			label: "Newest",
			group: "date",
			icon: Icons.CalendarMonth,
		},
		{
			key: "oldest",
			column: "createdAt",
			desc: false,
			label: "Oldest",
			group: "date",
			icon: Icons.CalendarMonth,
		},
		{
			key: "az",
			column: "name",
			desc: false,
			label: "A-Z",
			group: "name",
			icon: Icons.KeyboardArrowUp,
		},
		{
			key: "za",
			column: "name",
			desc: true,
			label: "Z-A",
			group: "name",
			icon: Icons.KeyboardArrowDown,
		},
	];

	// Use the DataControls hook
	const controls = useDataControls<Product>(search, `/${category.slug}`, filterOptions, sortOptions);

	return (
		<div className="flex-grow py-8 md:py-12">
			<MaxWidthWrapper>
				{/* Category Header */}
				<div className="mb-8 md:mb-10">
					<h1 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">{category.name}</h1>
					<p className="text-gray-600 max-w-3xl text-sm md:text-base">{category.description}</p>
				</div>

				{/* Data Controls */}
				<div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b">
					<DynamicDataControls
						controls={controls as any}
						filterOptions={filterOptions}
						sortOptions={sortOptions}
						searchPlaceholder="Search assets..."
					/>
				</div>

				{/* Gallery Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
					{category.products.map((product) => (
						<DynamicProductCard key={product.id} product={product} />
					))}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-8 flex justify-center">
						<DynamicPaginate
							pageCount={totalPages}
							currentPage={currentPage}
							baseUrl={`/${category.slug}`}
							searchParams={searchParams}
						/>
					</div>
				)}
			</MaxWidthWrapper>
		</div>
	);
}

function CategoryLoading() {
	return (
		<div className="flex-grow py-8 md:py-12">
			<MaxWidthWrapper>
				{/* Category Header Skeleton */}
				<div className="mb-8 md:mb-10">
					<div className="h-10 w-48 bg-gray-200 rounded-md animate-pulse mb-2 md:mb-3" />
					<div className="h-4 w-full max-w-3xl bg-gray-200 rounded-md animate-pulse" />
				</div>

				{/* Data Controls Skeleton */}
				<div className="mb-6 md:mb-8 pb-4 md:pb-6 border-b space-y-4">
					<div className="flex flex-wrap gap-2 items-center">
						<div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
						<div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
						<div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
					</div>
					<div className="flex flex-wrap gap-2 items-center">
						<div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse" />
					</div>
				</div>

				{/* Gallery Grid Skeleton */}
				<ProductGridSkeleton />
			</MaxWidthWrapper>
		</div>
	);
}

export default async function Page(props: PageProps) {
	return (
		<Suspense fallback={<CategoryLoading />}>
			<CategoryPage {...props} />
		</Suspense>
	);
}
