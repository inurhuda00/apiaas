import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getProductsByCategoryWithFilters } from "@/lib/db/queries/product";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
	const category = await getProductsByCategoryWithFilters("joydoodle", {
		page: 1,
		perPage: 6,
	});

	return (
		<div className="flex-grow">
			<section className="py-16 text-center bg-background">
				<MaxWidthWrapper className="max-w-5xl">
					<div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-accent text-accent-foreground rounded-md">
						<span>🔥</span>
						<span>Limited Time: 40% commission on all referrals!</span>
						<span>🔥</span>
					</div>

					<h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
						<span className="text-primary">Instantly Convert</span> Viewers With Exclusive{" "}
						<span className="text-primary">AI Backgrounds</span>
					</h1>

					<p className="text-lg text-muted-foreground mb-8">
						🚀 Join 500+ pros getting 2-3X higher engagement with our designs
					</p>

					{/* Trust indicators */}
					<div className="flex flex-col gap-4 mb-10">
						<div className="flex flex-wrap justify-center gap-4">
							<div className="bg-muted/70 px-4 py-2 rounded-lg flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-primary"
								>
									<title>Security icon</title>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
								</svg>
								<span className="font-medium">100% Money-Back Guarantee</span>
							</div>
							<div className="bg-muted/70 px-4 py-2 rounded-lg flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-primary"
								>
									<title>Heart icon</title>
									<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
								</svg>
								<span className="font-medium">4.9/5 Customer Rating</span>
							</div>
							<div className="bg-muted/70 px-4 py-2 rounded-lg flex items-center gap-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="text-primary"
								>
									<title>Check icon</title>
									<circle cx="12" cy="12" r="10" />
									<path d="m9 12 2 2 4-4" />
								</svg>
								<span className="font-medium">Instant Download</span>
							</div>
						</div>
					</div>

					<div className="flex justify-center">
						<div className="flex -space-x-2">
							<div className="w-10 h-10 bg-primary/20 border-2 border-background rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=J" alt="Avatar J" width={40} height={40} />
							</div>
							<div className="w-10 h-10 bg-primary/30 border-2 border-background rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=K" alt="Avatar K" width={40} height={40} />
							</div>
							<div className="w-10 h-10 bg-primary/40 border-2 border-background rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=L" alt="Avatar L" width={40} height={40} />
							</div>
							<div className="w-10 h-10 bg-primary/50 border-2 border-background rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden">
								<Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=M" alt="Avatar M" width={40} height={40} />
							</div>
						</div>
					</div>
					<div className="mt-2 text-sm text-muted-foreground">
						Trusted by <span className="font-medium text-primary">500+ creators</span> from 20+ countries worldwide
					</div>
				</MaxWidthWrapper>
			</section>

			<section>
				<MaxWidthWrapper>
					{/* Library size indicator */}
					<div className="mt-10 bg-card p-6 rounded-lg border">
						<div className="flex flex-col md:flex-row items-center gap-4 justify-between">
							<div>
								<h3 className="text-lg font-medium mb-2">Our growing background library</h3>
								<p className="text-sm text-muted-foreground">
									Access our entire collection of premium AI backgrounds with one subscription
								</p>
							</div>
							<div className="flex gap-3">
								<div className="text-center">
									<div className="text-2xl font-bold">1000+</div>
									<div className="text-xs text-muted-foreground">Backgrounds</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">12</div>
									<div className="text-xs text-muted-foreground">Categories</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold">Weekly</div>
									<div className="text-xs text-muted-foreground">Updates</div>
								</div>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>

			{category ? (
				<section className="py-8 bg-muted/50">
					<MaxWidthWrapper>
						<div className="flex justify-between items-center mb-6">
							<div>
								<h2 className="text-xl font-medium text-foreground">{category.name}</h2>
								<p className="text-sm text-muted-foreground mt-1">
									<span className="font-medium">{category.productCount}+ ready-to-use backgrounds</span> • Instant
									access
								</p>
							</div>
							<Link
								href={`/${category.slug}`}
								className="text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								view all backgrounds ›
							</Link>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
							{category.products.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>

						<div className="flex justify-between items-center mt-6 text-sm text-muted-foreground border-t border-border pt-6">
							<div>High-Resolution: SVG + PNG + JPG</div>
							<div>
								<Link
									href={`/${category.slug}`}
									className="hover:text-foreground transition-colors flex items-center gap-1"
								>
									<span>Browse all {category.productCount} backgrounds</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<title>Arrow right</title>
										<path d="M5 12h14" />
										<path d="m12 5 7 7-7 7" />
									</svg>
								</Link>
							</div>
						</div>
					</MaxWidthWrapper>
				</section>
			) : null}

			<section className="py-12">
				<MaxWidthWrapper>
					{/* Testimonials for trust */}
					<div className="mb-12">
						<h2 className="text-2xl font-bold text-center mb-8">What Creators Say</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="bg-card p-6 rounded-lg border">
								<div className="flex items-center mb-4">
									<div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden mr-3">
										<Image
											src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
											alt="Avatar"
											width={40}
											height={40}
										/>
									</div>
									<div>
										<div className="font-medium">Alex T.</div>
										<div className="text-xs text-muted-foreground">Content Creator</div>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									"I was skeptical at first, but these AI backgrounds honestly changed my game. My engagement jumped by
									47% last month. Best investment for my channel this year."
								</p>
								<div className="mt-3 flex">
									<span className="text-yellow-500">★★★★★</span>
								</div>
							</div>
							<div className="bg-card p-6 rounded-lg border">
								<div className="flex items-center mb-4">
									<div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden mr-3">
										<Image
											src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
											alt="Avatar"
											width={40}
											height={40}
										/>
									</div>
									<div>
										<div className="font-medium">Sarah K.</div>
										<div className="text-xs text-muted-foreground">Marketing Director</div>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									"Our team used to spend hours hunting for decent backgrounds. With Mondive, we just grab what we need
									and go. The quality is fantastic and our clients always ask where we get them."
								</p>
								<div className="mt-3 flex">
									<span className="text-yellow-500">★★★★★</span>
								</div>
							</div>
							<div className="bg-card p-6 rounded-lg border">
								<div className="flex items-center mb-4">
									<div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-foreground text-xs overflow-hidden mr-3">
										<Image
											src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
											alt="Avatar"
											width={40}
											height={40}
										/>
									</div>
									<div>
										<div className="font-medium">Michael R.</div>
										<div className="text-xs text-muted-foreground">Freelance Designer</div>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									"As a freelancer, I need to stand out without spending forever on each project. These backgrounds help
									me deliver unique work to every client without the usual design fatigue. Total game-changer."
								</p>
								<div className="mt-3 flex">
									<span className="text-yellow-500">★★★★★</span>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-card p-8 md:p-10 relative overflow-hidden border rounded-lg">
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<div className="text-center md:text-left">
								<div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-primary/10 text-primary rounded-full text-sm font-medium">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<title>Clock icon</title>
										<circle cx="12" cy="12" r="10" />
										<polyline points="12 6 12 12 16 14" />
									</svg>
									Limited Time Offer
								</div>
								<h2 className="text-3xl font-bold text-card-foreground mb-2">Unlimited Access</h2>
								<p className="text-muted-foreground mb-3">
									Get <span className="font-medium">lifetime access</span> to all AI backgrounds —{" "}
									<span className="line-through">$50</span> <span className="text-primary font-medium">$24.99</span>
								</p>

								<ul className="text-sm text-muted-foreground mb-6 space-y-2">
									<li className="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-primary"
										>
											<title>Check</title>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Unlimited access to all current backgrounds
									</li>
									<li className="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="text-primary"
										>
											<title>Check</title>
											<polyline points="20 6 9 17 4 12" />
										</svg>
										Instant access to all future updates
									</li>
								</ul>

								<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
									<Link href="/upgrade">
										<Button size="lg" className="font-medium bg-primary hover:bg-primary/90">
											Upgrade to Unlimited <span className="ml-2">→</span>
										</Button>
									</Link>
								</div>
								<p className="text-xs text-muted-foreground mt-4">
									⚡ New backgrounds added weekly — price increases with each update!
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
