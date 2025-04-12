import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getProductsByCategoryWithFilters } from "@/lib/db/queries/product";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { ProductCard } from "@/components/product-card";
import { unstable_cache as cache } from "next/cache";

export default async function HomePage() {
	const categoryCache = cache(
		async () =>
			await getProductsByCategoryWithFilters("joydoodle", {
				page: 1,
				perPage: 6,
			}),
		["category", "joydoodle", "1", "6"],
	);

	const category = await categoryCache();

	return (
		<div className="flex-grow">
			<section className="py-16 text-center">
				<MaxWidthWrapper className="max-w-5xl">
					<div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-accent text-accent-foreground">
						<span>✨</span>
						<span>Get 40% of each sale you bring!</span>
						<span>✨</span>
					</div>

					<h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
						Delight in artistry! These <span className="text-primary">fun</span>{" "}
						and <span className="text-primary">imaginative</span> works are
						tailor-made for those who appreciate the{" "}
						<span className="text-primary">extraordinary</span>
					</h1>

					<p className="text-lg text-muted-foreground mb-8">
						🚀 No boring stocks 👋 Use however you want
					</p>

					<div className="flex justify-center">
						<div className="flex -space-x-2">
							<div className="w-10 h-10 bg-primary/20 border-2 border-background flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image
									src="https://api.dicebear.com/7.x/avataaars/svg?seed=J"
									alt="Avatar J"
									width={40}
									height={40}
								/>
							</div>
							<div className="w-10 h-10 bg-primary/30 border-2 border-background flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image
									src="https://api.dicebear.com/7.x/avataaars/svg?seed=K"
									alt="Avatar K"
									width={40}
									height={40}
								/>
							</div>
							<div className="w-10 h-10 bg-primary/40 border-2 border-background flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image
									src="https://api.dicebear.com/7.x/avataaars/svg?seed=L"
									alt="Avatar L"
									width={40}
									height={40}
								/>
							</div>
							<div className="w-10 h-10 bg-primary/50 border-2 border-background flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image
									src="https://api.dicebear.com/7.x/avataaars/svg?seed=M"
									alt="Avatar M"
									width={40}
									height={40}
								/>
							</div>
						</div>
					</div>
					<div className="mt-2 text-sm text-muted-foreground">
						Trusted by 200+ users
					</div>
				</MaxWidthWrapper>
			</section>

			{category ? (
				<section className="py-8 bg-muted">
					<MaxWidthWrapper>
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-medium text-foreground">
								{category.name}
							</h2>
							<Link
								href={`/${category.slug}`}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								all works ›
							</Link>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
							{category.products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>

						<div className="flex justify-between items-center mt-6 text-sm text-muted-foreground border-t border-border pt-6">
							<div>File Type: SVG + PNG + JPG</div>
							<div>
								<Link
									href={`/${category.slug}`}
									className="hover:text-foreground transition-colors"
								>
									{category.productCount} Assets
								</Link>
							</div>
						</div>
					</MaxWidthWrapper>
				</section>
			) : null}

			<section className="py-8">
				<MaxWidthWrapper>
					<div className="bg-card p-8 md:p-10 relative overflow-hidden border">
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<div className="text-center md:text-left">
								<h2 className="text-3xl font-bold text-card-foreground mb-2">
									Unlimited Access
								</h2>
								<p className="text-muted-foreground mb-6">
									Access all assets with lifetime license
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
									<Link href="/upgrade">
										<Button>Get Unlimited Access</Button>
									</Link>
								</div>
								<p className="text-xs text-muted-foreground mt-4">
									Prices will increment with new addition
								</p>
							</div>
							<div className="flex justify-center md:justify-end">
								<div className="relative w-60 h-60">
									<Image
										src="https://ext.same-assets.com/2551241482/3090076002.png"
										alt="Unlimited Access"
										fill
										className="object-contain"
									/>
								</div>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>
		</div>
	);
}
