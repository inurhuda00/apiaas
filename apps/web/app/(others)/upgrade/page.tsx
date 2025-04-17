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
		icon: <Icons.Download className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "Weekly new releases",
		icon: <Icons.CalendarMonth className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "Commercial license included",
		icon: <Icons.Info className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "Lifetime updates",
		icon: <Icons.Info className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "High-resolution source files",
		icon: <Icons.Check className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "Early access to collections",
		icon: <Icons.Check className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "Premium support",
		icon: <Icons.Check className="h-5 w-5 text-orange-500" />,
	},
	{
		title: "Single user license",
		icon: <Icons.People className="h-5 w-5 text-orange-500" />,
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
		<div className="flex-grow py-12 bg-gradient-to-b from-white to-gray-50">
			<MaxWidthWrapper>
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold mb-4">Premium Access</h1>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Get unlimited access to our entire collection with a lifetime license
					</p>
				</div>

				<div className="grid md:grid-cols-5 gap-8 mb-16">
					{/* Features column */}
					<div className="md:col-span-3 bg-white border p-8">
						<h2 className="text-2xl font-bold mb-8">Everything You Need</h2>

						<div className="grid md:grid-cols-2 gap-6">
							{features.map((feature, index) => (
								<div key={feature.title} className="flex items-start">
									<div className="mr-3 mt-0.5">{feature.icon}</div>
									<span className="text-gray-800">{feature.title}</span>
								</div>
							))}
						</div>

						<div className="mt-10 pt-8 border-t">
							<div className="flex items-center gap-4">
								<div className="flex justify-center">
									<div className="flex -space-x-2">
										<div className="w-10 h-10  bg-red-400 border-2 border-white flex items-center justify-center text-white text-xs overflow-hidden">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=J"
												alt="Avatar J"
												width={40}
												height={40}
											/>
										</div>
										<div className="w-10 h-10  bg-blue-400 border-2 border-white flex items-center justify-center text-white text-xs overflow-hidden">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=K"
												alt="Avatar K"
												width={40}
												height={40}
											/>
										</div>
										<div className="w-10 h-10  bg-green-400 border-2 border-white flex items-center justify-center text-white text-xs overflow-hidden">
											<Image
												src="https://api.dicebear.com/7.x/avataaars/svg?seed=L"
												alt="Avatar L"
												width={40}
												height={40}
											/>
										</div>
										<div className="w-10 h-10  bg-purple-400 border-2 border-white flex items-center justify-center text-white text-xs overflow-hidden">
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
									<div className="text-sm text-gray-500">Get inspired by fellow creators</div>
								</div>
							</div>
						</div>
					</div>

					{/* Pricing column */}
					<div className="md:col-span-2 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-8">
						<div className="space-y-6">
							<div>
								<div className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1  mb-3">
									BEST VALUE
								</div>
								<h3 className="text-xl font-bold">Lifetime Premium</h3>
								<div className="flex items-end mt-2">
									<span className="text-5xl font-bold">$24</span>
									<span className="text-gray-500 ml-2 mb-1">.99</span>
								</div>
								<p className="text-sm text-gray-600 mt-1">One-time payment, lifetime access</p>
							</div>
							<div>
								<Link
									href={`/api/checkout?productId=${env.PRODUCT_ID}`}
									className={cn(buttonVariants(), "w-full bg-orange-500 hover:bg-orange-600 h-12 text-base")}
								>
									Get Premium Access
								</Link>
								<p className="text-xs text-center mt-3 text-gray-500">Secure payment powered by Polar.sh</p>
							</div>

							<div className="pt-4 border-t mt-6">
								<div className="flex items-center">
									<Icons.Info className="h-5 w-5 text-gray-400 mr-2" />
									<h4 className="font-medium text-sm">100% Satisfaction Guaranteed</h4>
								</div>
								<p className="text-xs text-gray-600 mt-1">
									Try risk-free with our 30-day money-back guarantee. No questions asked.
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white border p-8 mb-12">
					<h2 className="text-2xl font-bold mb-8">Common Questions</h2>

					<div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
						{faqs.map((faq) => (
							<div key={faq.question}>
								<h3 className="font-bold mb-2 text-gray-900">{faq.question}</h3>
								<p className="text-gray-600 text-sm">{faq.answer}</p>
							</div>
						))}
					</div>
				</div>

				<div className="text-center">
					<p className="text-sm text-gray-500">
						Have more questions?{" "}
						<a href="mailto:support@funnnit.com" className="text-orange-600 hover:text-orange-500">
							Contact our support team
						</a>
					</p>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
