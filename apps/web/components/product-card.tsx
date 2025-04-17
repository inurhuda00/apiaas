import Image from "next/image";
import Link from "next/link";
import type { Product, Category, Image as ImageType } from "@apiaas/db/schema";

type ProductWithRelations = Pick<Product, "id" | "name" | "slug" | "locked"> & {
	category: Pick<Category, "id" | "slug" | "name">;
	images: Pick<ImageType, "id" | "url" | "productId" | "isPrimary">[];
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
	const thumbnail = product.images.find((image) => image.isPrimary);

	return (
		<div className="group relative overflow-hidden border bg-card">
			<Link href={`${product.category.slug}/${product.slug}`}>
				<div className="relative aspect-square w-full">
					{thumbnail && (
						<Image
							src={thumbnail.url}
							alt={product.name}
							fill
							className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
						/>
					)}
				</div>
			</Link>

			{product.locked && (
				<div className="absolute top-4 right-4">
					<span className="bg-primary/80 text-primary-foreground text-xs px-2 py-1">PRO</span>
				</div>
			)}

			<div className="flex items-center justify-between p-4 border-t">
				<div className="w-full">
					<h3 className="font-medium text-card-foreground text-sm truncate whitespace-nowrap">{product.name}</h3>
				</div>
			</div>
		</div>
	);
}
