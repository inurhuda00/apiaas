import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/queries/product";
import { notFound } from "next/navigation";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { Badge } from "@/components/ui/badge";
import { unstable_cache as cache } from "next/cache";
import { Icons } from "@/components/ui/icons";
interface PageProps {
	params: Promise<{
		category: string;
		slug: string;
	}>;
}

export default async function ProductPage({ params }: PageProps) {
	const { category, slug } = await params;

	const productCache = cache(
		async () => await getProductBySlug(category, slug),
		["product", category, slug],
	);

	const product = await productCache();

	if (!product) notFound();

	const thumbnail = product.images.find((image) => image.isPrimary);

	const relatedProductsCache = cache(
		async () => await getRelatedProducts(product.category.id, product.id, 4),
		["related", String(product.category.id), String(product.id)],
	);
	const relatedProducts = await relatedProductsCache();

	return (
		<div className="flex-grow py-6 md:py-12">
			<MaxWidthWrapper>
				{/* Breadcrumb Navigation */}
				<div className="mb-4 md:mb-6 text-xs md:text-sm">
					<Link href="/" className="text-gray-500 hover:text-gray-700">
						Home
					</Link>
					<span className="mx-2 text-gray-400">/</span>
					<Link
						href={`/${product.category.slug}`}
						className="text-gray-500 hover:text-gray-700"
					>
						{product.category.name}
					</Link>
					<span className="mx-2 text-gray-400">/</span>
					<span className="text-gray-700 truncate inline-block align-bottom">
						{product.name}
					</span>
				</div>

				<div className="flex flex-col lg:flex-row gap-6 md:gap-12">
					{/* Left Column - Image */}
					<div className="w-full lg:w-2/3">
						<div className="bg-white  overflow-hidden border shadow-sm">
							<div className="relative aspect-square">
								{thumbnail ? (
									<Image
										src={thumbnail.url}
										alt={product.name}
										fill
										priority
										className="object-contain p-6 md:p-8"
									/>
								) : null}
							</div>
						</div>

						{/* Tags Section */}
						<div className="mt-4 md:mt-6">
							<h3 className="text-sm font-medium mb-2 md:mb-3">Tags</h3>
							<div className="flex flex-wrap gap-1.5 md:gap-2">
								{product.tags.map((tag) => (
									<Link
										key={tag.id}
										href={`/${category}?tag=${tag.slug}`}
										className="px-2 md:px-3 py-1 bg-gray-100 text-gray-700 text-xs  hover:bg-gray-200"
									>
										{tag.name}
									</Link>
								))}
							</div>
						</div>

						{/* Related Assets */}
						{relatedProducts.length > 0 && (
							<div className="mt-8 md:mt-12">
								<h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">
									Related Assets
								</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
									{relatedProducts.map((product) => (
										<Link
											key={product.slug}
											href={`/${category}/${product.slug}`}
											className="block group"
										>
											<div className="relative aspect-square bg-white border  overflow-hidden">
												{product.thumbnail ? (
													<Image
														src={product.thumbnail}
														alt={product.title}
														fill
														className="object-contain p-2 md:p-3 transition-transform group-hover:scale-105"
													/>
												) : null}
												{product.locked && (
													<Badge
														variant="tag"
														className="absolute top-1 right-1"
													>
														pro
													</Badge>
												)}
											</div>
											<h4 className="text-xs mt-1 truncate">{product.title}</h4>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Right Column - Info */}
					<div className="w-full lg:w-1/3">
						<div className="lg:sticky lg:top-4">
							<h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">
								{product.name}
							</h1>
							<div className="mb-4 md:mb-6">
								<p className="text-gray-700 text-sm md:text-base">
									{product.description}
								</p>
							</div>

							{/* Asset Info Cards */}
							<div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
								<div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-gray-50 ">
									<Icons.Check
										size={16}
										className="text-green-500 mt-0.5 shrink-0"
									/>
									<div>
										<h3 className="font-medium text-xs md:text-sm">
											Commercial Usage
										</h3>
										<p className="text-xs text-gray-500">
											Use in any personal or commercial projects
										</p>
									</div>
								</div>

								<div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 bg-gray-50 ">
									<Icons.TimeCog className="text-blue-500 mt-0.5 shrink-0" />
									<div>
										<h3 className="font-medium text-xs md:text-sm">
											Available Formats
										</h3>
										<div className="flex flex-wrap gap-1 md:gap-2 mt-1">
											{product.files.map((file) => file.extension).join(", ")}
										</div>
									</div>
								</div>
							</div>

							{!product.locked ? (
								<div className="space-y-2 md:space-y-4">
									<Button
										className="w-full flex items-center justify-center gap-2 h-10 md:h-12 bg-black text-white hover:bg-gray-800 text-sm md:text-base"
										type="button"
									>
										<Icons.Download />
										Download Free Asset
									</Button>
									<p className="text-xs text-center text-gray-500">
										No login required. Free to use with attribution.
									</p>
								</div>
							) : (
								<div className="space-y-3 md:space-y-4">
									<div className="p-4 md:p-5 bg-gray-50  border">
										<div className="flex items-center gap-2 mb-3 md:mb-4">
											<Icons.Security className="text-gray-400" />
											<h3 className="font-medium text-sm">Premium Asset</h3>
										</div>
										<Link href="/upgrade">
											<Button
												className="w-full bg-black text-white hover:bg-gray-800 text-sm md:text-base"
												type="button"
											>
												Get Unlimited Access
											</Button>
										</Link>
										<div className="mt-2 md:mt-3 text-center">
											<p className="text-xs md:text-sm text-gray-600">
												Lifetime license • One-time payment
											</p>
											<p className="text-xs text-gray-500 mt-1">
												Includes all premium assets
											</p>
										</div>
									</div>
								</div>
							)}

							<div className="mt-6 md:mt-8 border-t pt-4 md:pt-6">
								<h2 className="font-medium mb-2 md:mb-3 text-xs md:text-sm">
									License Information
								</h2>
								<p className="text-xs md:text-sm text-gray-600 mb-2">
									{!product.locked
										? "This free asset can be used in personal and commercial projects without attribution."
										: "This premium asset requires an Unlimited Access license for use in personal and commercial projects."}
								</p>
								<Link
									href="/license"
									className="text-xs md:text-sm text-blue-600 hover:underline"
								>
									View Full License Details
								</Link>
							</div>
						</div>
					</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
