"use cache";

import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LicensePage() {
	return (
		<div className="flex-grow py-12">
			<MaxWidthWrapper className="max-w-4xl">
				<h1 className="text-3xl font-bold mb-8">License Agreement</h1>

				<div className="prose max-w-none dark:prose-invert">
					<h2 className="text-2xl font-bold mt-8 mb-4">Overview</h2>
					<p className="mb-4">
						This License Agreement outlines the terms and conditions for using the assets provided by Mondive.
						By downloading or using any assets from our platform, you agree to comply with these terms.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Free Assets</h2>
					<p className="mb-4">
						All free assets available on Mondive may be used for both personal and commercial projects without
						attribution, though attribution is appreciated.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Prohibited Uses</h2>
					<p className="mb-4">You may not:</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">Redistribute or resell any assets as standalone files</li>
						<li className="mb-2">
							You may not use these assets to create derivative products that compete directly with Mondive.
						</li>
						<li className="mb-2">Use the assets in any illegal or defamatory context</li>
						<li className="mb-2">
							Claim ownership or trademark of any assets available on our platform
						</li>
					</ul>

					<h2 className="text-2xl font-bold mt-8 mb-4">Premium Assets License</h2>
					<p className="mb-4">
						Premium assets available with an Unlimited Access subscription are subject to the same conditions as free
						assets, plus the following:
					</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">
							Your license is perpetual and allows you to use downloaded assets indefinitely, even if your subscription
							is no longer active.
						</li>
						<li className="mb-2">
							Each license is for a single user only. Team licenses are available for multiple users.
						</li>
						<li className="mb-2">You may use premium assets in unlimited commercial projects with no royalty fees.</li>
					</ul>

					<h2 className="text-2xl font-bold mt-8 mb-4">License Upgrades</h2>
					<p className="mb-4">
						You can upgrade to an Unlimited Access license at any time to gain full access to all premium assets.
					</p>
					<div className="flex justify-center my-8">
						<Link href="/upgrade">
							<Button>Upgrade to Unlimited Access</Button>
						</Link>
					</div>

					<h2 className="text-2xl font-bold mt-8 mb-4">Modifications</h2>
					<p className="mb-4">
						Mondive reserves the right to modify this license agreement at any time. Any changes will be effective
						immediately upon posting on our website.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Contact</h2>
					<p className="mb-4">
						If you have any questions about this license, please contact us at:{" "}
						<a href="mailto:asticosmo@gmail.com" className="text-primary hover:underline">
							asticosmo@gmail.com
						</a>
					</p>

					<div className="mt-8 text-sm text-muted-foreground">Last Updated: March 15, 2025</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
