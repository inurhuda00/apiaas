import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getProductsByCategoryWithFilters } from "@/lib/db/queries/product";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
	const category = await getProductsByCategoryWithFilters("joydoodle", {
		page: 1,
		perPage: 6,
	});

	const collections = [
		{
			id: "fusion",
			title: "Fusion",
			count: 12,
			image: "/images/backgrounds/fusion.webp",
		},
		{
			id: "aberrant",
			title: "Aberrant",
			count: 12,
			image: "/images/backgrounds/aberrant.webp",
		},
		{
			id: "ethereal",
			title: "Ethereal",
			count: 12,
			image: "/images/backgrounds/ethereal.webp",
		},
		{
			id: "dispersion",
			title: "Dispersion",
			count: 12,
			image: "/images/backgrounds/dispersion.webp",
		},
		{
			id: "gauze",
			title: "Gauze",
			count: 12,
			image: "/images/backgrounds/gauze.webp",
		},
		{
			id: "roseate",
			title: "Roseate",
			count: 12,
			image: "/images/backgrounds/roseate.webp",
		},
	];

	return (
		<div className="flex-grow">
			<section className="py-16 mt-6 text-center bg-background">
				<MaxWidthWrapper className="max-w-5xl">
					<h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-foreground">
						<span className="text-primary">Instantly Convert</span> Viewers With Exclusive{" "}
						<span className="text-primary">AI Backgrounds</span>
					</h1>

					<p className="text-lg text-muted-foreground">
						Browse our collection of breath-taking AI generated backgrounds, download in glorious 6K and access the
						Midjourney prompts used to create them.
					</p>
				</MaxWidthWrapper>
			</section>

			<section className="py-8 bg-muted/50">
				<MaxWidthWrapper>
					{/* Library size indicator */}
					<div className="mt-10 bg-card p-4 sm:p-6 rounded-lg border">
						<div className="flex flex-col md:flex-row items-center gap-4 justify-between">
							<div className="text-center md:text-left w-full md:w-auto">
								<h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Our growing background library</h3>
								<p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto md:mx-0">
									Access our entire collection of premium AI backgrounds with one subscription
								</p>
							</div>
							<div className="flex flex-wrap justify-center md:flex-nowrap gap-3 sm:gap-4 mt-3 md:mt-0 w-full md:w-auto">
								<div className="text-center px-2 sm:px-3">
									<div className="text-xl sm:text-2xl font-bold">1000+</div>
									<div className="text-xs text-muted-foreground">Backgrounds</div>
								</div>
								<div className="text-center px-2 sm:px-3">
									<div className="text-xl sm:text-2xl font-bold">12</div>
									<div className="text-xs text-muted-foreground">Categories</div>
								</div>
								<div className="text-center px-2 sm:px-3">
									<div className="text-xl sm:text-2xl font-bold">Weekly</div>
									<div className="text-xs text-muted-foreground">Updates</div>
								</div>
							</div>
						</div>
					</div>
				</MaxWidthWrapper>
			</section>

			<section className="py-8 bg-muted/50">
				<MaxWidthWrapper>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-semibold">Browse Collections</h2>
					<Button variant="ghost" className="text-gray-400 hover:text-white">
						See All
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
							className="ml-1"
							aria-hidden="true"
						>
							<path d="m9 18 6-6-6-6" />
						</svg>
					</Button>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{collections.map((collection) => (
						<Link href={`/backgrounds/collections/${collection.id}`} key={collection.id}>
							<Card className="group relative overflow-hidden bg-gray-900 border-0 rounded-lg h-48 transition-transform hover:-translate-y-1">
								<div className="absolute inset-0">
									<div className="relative h-full w-full">
										<Image
											src={collection.image}
											alt={collection.title}
											fill
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
											className="object-cover"
										/>
									</div>
								</div>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
								<div className="absolute bottom-4 left-4 z-10">
									<h3 className="text-xl font-semibold text-white">{collection.title}</h3>
									<p className="text-sm text-gray-300">{collection.count} backgrounds</p>
								</div>
								<div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
									<Button
										size="sm"
										variant="ghost"
										className="bg-white/10 backdrop-blur-sm text-white rounded-full h-8 w-8 p-0"
									>
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
											aria-hidden="true"
										>
											<path d="m9 18 6-6-6-6" />
										</svg>
									</Button>
								</div>
							</Card>
						</Link>
					))}
				</div>
				</MaxWidthWrapper>
			</section>

			{/* Most Downloaded Section */}
			<section className="py-8 bg-muted/50">
				<MaxWidthWrapper>
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-xl font-medium text-foreground">Most Downloaded</h2>
							<p className="text-sm text-muted-foreground mt-1">
								<span className="font-medium">Popular backgrounds loved by creators</span> • Instant
								access
							</p>
						</div>
						<Link
							href="/backgrounds"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							view all backgrounds ›
						</Link>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
						{category?.products.map((item) => (
							<ProductCard key={item.id} product={item} />
						))}
					</div>
				</MaxWidthWrapper>
			</section>

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
