import { ProductCard } from "@/components/product-card";
import type { Product, Category, Image as ImageType } from "@apiaas/db/schema";

type ProductWithRelations = Pick<Product, "id" | "name" | "slug" | "locked"> & {
	category: Pick<Category, "id" | "slug" | "name">;
	images: Pick<ImageType, "id" | "url" | "productId" | "isPrimary">[];
};

export function ProductGrid({
	products,
}: { products: ProductWithRelations[] }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

export function ProductGridSkeleton() {
	// Create a fixed array with unique identifiers to avoid using index as key
	const skeletonItems = [
		{ id: "skeleton-1" },
		{ id: "skeleton-2" },
		{ id: "skeleton-3" },
		{ id: "skeleton-4" },
		{ id: "skeleton-5" },
		{ id: "skeleton-6" },
	];

	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
			{skeletonItems.map((item) => (
				<ProductCardSkeleton key={item.id} />
			))}
		</div>
	);
}

export function ProductCardSkeleton() {
	return (
		<div className="border bg-card">
			<div className="relative aspect-square w-full bg-gray-200 animate-pulse" />
			<div className="p-4 border-t">
				<div className="h-4 w-2/3 bg-gray-200 rounded-md animate-pulse" />
			</div>
		</div>
	);
}
