import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product, Category, Image as ImageType } from "@apiaas/db/schema";
import { Icons } from "./ui/icons";

type ProductWithRelations = Pick<Product, "id" | "name" | "slug" | "locked"> & {
	category: Pick<Category, "id" | "slug" | "name">;
	images: Pick<ImageType, "id" | "url" | "productId" | "sort">[];
};

export function ProductCard({ product }: { product: ProductWithRelations }) {
	// Get the first image by sort order (lowest sort value)
	const thumbnail = product.images.length > 0 ? [...product.images].sort((a, b) => a.sort - b.sort)[0] : null;

	return (
		<Link href={`${product.category.slug}/${product.slug}`}>
			<Card className="group relative overflow-hidden bg-gray-900 border-0 rounded-lg aspect-[1.7867/1] transition-transform hover:-translate-y-1">
				<div className="absolute inset-0">
					<div className="relative h-full w-full">
						{thumbnail && (
							<Image
								src={thumbnail.url}
								alt={product.name}
								fill
								sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
								className="object-cover"
							/>
						)}
					</div>
				</div>

				{product.locked && (
					<div className="absolute top-3 right-3 z-10">
						<span className="bg-primary/80 text-primary-foreground text-xs px-2 py-1 rounded">PRO</span>
					</div>
				)}

				<div className="absolute top-3 left-3 z-10">
					<Button
						size="sm"
						variant="ghost"
						className="bg-white/10 backdrop-blur-sm text-white rounded-full h-8 w-8 p-0"
					>
						<Icons.Download />
					</Button>
				</div>
			</Card>
		</Link>
	);
}
