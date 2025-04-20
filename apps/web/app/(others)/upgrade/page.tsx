"use cache";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import Image from "next/image";
import { env } from "@/env";

const features = [
	{
		title: "Access to all premium assets",
		icon: <Icons.Download className="h-5 w-5 text-primary" />,
	},
	{
		title: "Weekly new releases",
		icon: <Icons.CalendarMonth className="h-5 w-5 text-primary" />,
	},
	{
		title: "Commercial license included",
		icon: <Icons.Info className="h-5 w-5 text-primary" />,
	},
	{
		title: "Lifetime updates",
		icon: <Icons.Info className="h-5 w-5 text-primary" />,
	},
	{
		title: "High-resolution source files",
		icon: <Icons.Check className="h-5 w-5 text-primary" />,
	},
	{
		title: "Early access to collections",
		icon: <Icons.Check className="h-5 w-5 text-primary" />,
	},
	{
		title: "Premium support",
		icon: <Icons.Check className="h-5 w-5 text-primary" />,
	},
	{
		title: "Single user license",
		icon: <Icons.People className="h-5 w-5 text-primary" />,
	},
];

const faqs = [
	{
		question: "What's included in the premium access?",
		answer:
			"Premium access includes all current and future assets, commercial usage rights, source files, and lifetime updates.",
	},
	{
		question: "What are the usage terms?",
		answer:
			"You can use all assets in unlimited personal and commercial projects. No attribution required. Reselling or redistributing the raw assets is not permitted.",
	},
	{
		question: "Do you offer refunds?",
		answer:
			"Yes, we offer a 30-day satisfaction guarantee. If you're not happy with your purchase, we'll provide a full refund.",
	},
	{
		question: "How do I access the assets?",
		answer:
			"After purchase, you'll get immediate access to all premium assets through your dashboard. Download them individually or in collections.",
	},
	{
		question: "Can I use these for client work?",
		answer:
			"Yes! Your license covers both personal and client projects. There's no limit on the number of projects you can use them in.",
	},
	{
		question: "How often do you add new assets?",
		answer:
			"We release new assets weekly, ensuring our collection stays fresh and relevant. All new releases are included in your premium access.",
	},
];

export default async function UpgradePage() {
	return (
		<div className="flex-grow py-12 bg-background">
			<MaxWidthWrapper>
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4 text-foreground">Premium Access</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Get unlimited access to our entire collection with a lifetime license
					</p>
				</div>

				<div className="grid md:grid-cols-5 gap-8 mb-16">
					{/* Features column */}
					<div className="md:col-span-3 bg-card text-card-foreground border rounded-lg p-8">
						<h2 className="text-2xl font-bold mb-8">Everything You Need</h2>

						<div className="grid md:grid-cols-2 gap-6">
							{features.map((feature, index) => (
								<div key={feature.title} className="flex items-start">
									<div className="mr-3 mt-0.5">{feature.icon}</div>
									<span className="text-card-foreground">{feature.title}</span>
								</div>
							))}
						</div>

						<div className="mt-10 pt-8 border-t">
							<div className="flex items-center gap-4">
								<div className="flex justify-center">
									<div className="flex -space-x-2">
										<div className="w-10 h-10 bg-primary border-2 border-background flex items-center justify-center text-primary-foreground text-xs overflow-hidden rounded-full">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=J"
												alt="Avatar J"
												width={40}
												height={40}
											/>
										</div>
										<div className="w-10 h-10 bg-accent border-2 border-background flex items-center justify-center text-accent-foreground text-xs overflow-hidden rounded-full">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=K"
												alt="Avatar K"
												width={40}
												height={40}
											/>
										</div>
										<div className="w-10 h-10 bg-secondary border-2 border-background flex items-center justify-center text-secondary-foreground text-xs overflow-hidden rounded-full">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=L"
												alt="Avatar L"
												width={40}
												height={40}
											/>
										</div>
										<div className="w-10 h-10 bg-muted border-2 border-background flex items-center justify-center text-muted-foreground text-xs overflow-hidden rounded-full">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=M"
												alt="Avatar M"
												width={40}
												height={40}
											/>
										</div>
									</div>
								</div>
								<div>
									<div className="font-medium">Join our creator community</div>
									<div className="text-sm text-muted-foreground">Get inspired by fellow creators</div>
								</div>
							</div>
						</div>
					</div>

					{/* Pricing column */}
					<div className="md:col-span-2 bg-accent/20 border border-accent rounded-lg p-8">
						<div className="space-y-6">
							<div>
								<div className="inline-block bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded mb-3">
									BEST VALUE
								</div>
								<h3 className="text-xl font-bold">Lifetime Premium</h3>
								<div className="flex items-end mt-2">
									<span className="text-5xl font-bold">$24</span>
									<span className="text-muted-foreground ml-2 mb-1">.99</span>
								</div>
								<p className="text-sm text-muted-foreground mt-1">One-time payment, lifetime access</p>
							</div>
							<div>
								<Link
									href={`/api/checkout?productId=${env.PRODUCT_ID}`}
									className={cn(buttonVariants(), "w-full bg-primary hover:bg-primary/90 h-12 text-base")}
								>
									Get Premium Access
								</Link>
								<p className="text-xs text-center mt-3 text-muted-foreground">Secure payment powered by Polar.sh</p>
							</div>

							<div className="pt-4 border-t mt-6">
								<div className="flex items-center">
									<Icons.Info className="h-5 w-5 text-muted-foreground mr-2" />
									<h4 className="font-medium text-sm">100% Satisfaction Guaranteed</h4>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Try risk-free with our 30-day money-back guarantee. No questions asked.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-card text-card-foreground border rounded-lg p-8 mb-12">
					<h2 className="text-2xl font-bold mb-8">Common Questions</h2>

					<div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
						{faqs.map((faq) => (
							<div key={faq.question}>
								<h3 className="font-bold mb-2 text-card-foreground">{faq.question}</h3>
								<p className="text-muted-foreground text-sm">{faq.answer}</p>
							</div>
						))}
					</div>
				</div>

				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Have more questions?{" "}
						<a href="mailto:support@funnnit.com" className="text-primary hover:text-primary/80">
							Contact our support team
						</a>
					</p>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
