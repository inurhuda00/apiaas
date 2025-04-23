import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/queries/product";
import { notFound } from "next/navigation";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { Icons } from "@/components/ui/icons";
import ProductButton from "../_components/product-button";
import { DynamicProductCard } from "@/components/lazy-components";
import { ExpandableDescription } from "./_components/expandable-description";

interface PageProps {
	params: Promise<{
		category: string;
		slug: string;
	}>;
}

export default async function ProductPage({ params }: PageProps) {
	const { category, slug } = await params;

	const product = await getProductBySlug(category, slug);

	if (!product) notFound();

	const images = [...product.images].sort((a, b) => a.sort - b.sort);
	const thumbnail = images.length > 0 ? images[0] : null;

	const relatedProducts = await getRelatedProducts(product.category.id, product.id, 4);

	const fileTypes = product.files
		.map((file) => {
			const extension = file.extension.toUpperCase();
			return extension ? `.${extension}` : "";
		})
		.filter(Boolean);

	const availableFileTypes = fileTypes.length > 0 ? [...new Set(fileTypes)] : [".SVG", ".PNG", ".JPG"];

	const updatedDate = product.updatedAt ? new Date(product.updatedAt) : new Date();
	const formattedDate = updatedDate.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const imageResolution = "6K - 5824 x 3264";

	return (
		<div className="flex-grow py-6 md:py-12">
			<MaxWidthWrapper>
				{/* Breadcrumb Navigation */}
				<div className="mb-4 md:mb-6 text-xs md:text-sm">
					<Link href="/" className="text-muted-foreground hover:text-foreground">
						Home
					</Link>
					<span className="mx-2 text-muted-foreground/60">/</span>
					<Link href={`/${product.category.slug}`} className="text-muted-foreground hover:text-foreground">
						{product.category.name}
					</Link>
					<span className="mx-2 text-muted-foreground/60">/</span>
					<span className="text-foreground truncate inline-block align-bottom">{product.name}</span>
				</div>

				<div className="flex flex-col lg:flex-row gap-6 md:gap-10">
					{/* Left Column - Image */}
					<div className="w-full lg:w-2/3">
						<div className="bg-card overflow-hidden border shadow-sm rounded-lg hover:shadow-md transition-shadow duration-300">
							<div className="relative aspect-[1.7867/1]">
								{thumbnail ? (
									<Image src={thumbnail.url} alt={product.name} fill priority className="object-cover" />
								) : null}
								{product.locked && (
									<div className="absolute top-4 right-4 z-10">
										<span className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
											PREMIUM
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Description with Read More/Less */}
						<div className="mt-4 md:mt-5 p-4 border border-border/40 rounded-lg bg-card/30">
							<ExpandableDescription description={product.description || ""} isAiGenerated={true} />
						</div>

						{/* Tags Section */}
						<div className="mt-4 md:mt-5">
							<h3 className="text-xs font-medium mb-2 text-muted-foreground">Tags</h3>
							<div className="flex flex-wrap gap-1.5">
								{product.tags.map((tag) => (
									<Link
										key={tag.id}
										href={`/${category}?tag=${tag.slug}`}
										className="px-2 py-0.5 bg-muted/80 text-foreground text-xs hover:bg-primary/10 hover:text-primary transition-colors duration-200"
									>
										{tag.name}
									</Link>
								))}
							</div>
						</div>
					</div>

					{/* Right Column - Info */}
					<div className="w-full lg:w-1/3">
						<div className="lg:sticky lg:top-4">
							<h1 className="text-lg md:text-xl font-bold mb-1">{product.name}</h1>

							{/* Asset Info Cards */}
							<div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-primary/20 transition-colors duration-200 mb-2">
								<Icons.Check size={14} className="text-green-500 mt-0.5 shrink-0" />
								<div>
									<h3 className="font-medium text-xs">Commercial Usage</h3>
									<p className="text-xs text-muted-foreground">Use in unlimited personal or commercial projects</p>
								</div>
							</div>
							<div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-primary/20 transition-colors duration-200 mb-2">
								<Icons.Check size={14} className="text-green-500 mt-0.5 shrink-0" />
								<div>
									<h3 className="font-medium text-xs">High Resolution</h3>
									<p className="text-xs text-muted-foreground">Premium quality assets with crisp details at any size</p>
								</div>
							</div>
							<div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg border border-border/40 hover:border-primary/20 transition-colors duration-200 mb-2">
								<Icons.Image size={14} className="text-green-500 mt-0.5 shrink-0" />
								<div>
									<h3 className="font-medium text-xs">Image Resolution</h3>
									<p className="text-xs text-muted-foreground">{imageResolution}</p>
								</div>
							</div>
							<ProductButton
								product={{
									id: product.id,
									locked: product.locked,
									files: product.files,
								}}
							/>

							<div className="mt-4 space-y-5 border-t border-border/40 pt-4">
								{/* File Type and Release Info */}
								<div className="flex justify-between items-center">
									<div>
										<span className="text-xs text-muted-foreground mr-1.5">File Type:</span>
										<span className="inline-flex gap-1">
											{availableFileTypes.map((type) => (
												<span key={type} className="px-1.5 py-0.5 bg-green-100/30 text-green-600 text-xs rounded-sm">
													{type}
												</span>
											))}
										</span>
									</div>
									<div className="flex items-center gap-1">
										<Icons.AutoAwesome className="h-3.5 w-3.5 text-muted-foreground" />
										<span className="text-xs text-muted-foreground">Human-AI Remix</span>
									</div>
								</div>

								{/* Release Date and ID */}
								<div className="flex justify-between items-center">
									<div>
										<span className="text-xs text-muted-foreground mr-1.5">Release:</span>
										<span className="text-xs">{formattedDate}</span>
									</div>
									<div className="text-xs text-muted-foreground px-1.5 py-0.5 border border-border/40 rounded">
										ID #{product.id}
									</div>
								</div>
								{/* License Information */}
								<div>
									<h2 className="font-medium mb-2 text-xs">License Information</h2>
									<p className="text-xs text-muted-foreground mb-2">
										{!product.locked
											? "This free asset can be used in personal and commercial projects without attribution. Upgrade for more premium assets!"
											: "This premium asset includes an Unlimited Access license for use in unlimited personal and commercial projects."}
									</p>
									<Link href="/license" className="text-xs text-primary hover:underline font-medium">
										View Full License Details →
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* Related Assets */}
				{relatedProducts.length > 0 && (
					<div className="mt-8 md:mt-10">
						<h3 className="text-base font-bold mb-3">You Might Also Like</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
							{relatedProducts.map((product) => (
								<DynamicProductCard key={product.id} product={product} />
							))}
						</div>
					</div>
				)}
			</MaxWidthWrapper>
		</div>
	);
}
