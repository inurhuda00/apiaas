"use cache";

import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import Link from "next/link";

export default async function LicensePage() {
	return (
		<div className="flex-grow py-12">
			<MaxWidthWrapper className="max-w-4xl">
				<h1 className="text-3xl font-bold mb-8">License Agreement</h1>

				<div className="prose max-w-none">
					<p className="text-lg mb-6">
						This License Agreement outlines the terms and conditions for using the assets provided by Funnnit.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Free Assets License</h2>
					<p className="mb-4">
						All free assets available on Funnnit may be used for both personal and commercial projects without
						attribution, subject to the following conditions:
					</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">You may not resell or redistribute these assets as standalone files.</li>
						<li className="mb-2">You may not claim these assets as your own original work.</li>
						<li className="mb-2">
							You may not use these assets to create derivative products that compete directly with Funnnit.
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

					<h2 className="text-2xl font-bold mt-8 mb-4">Prohibited Uses</h2>
					<p className="mb-4">The following uses are strictly prohibited for all assets:</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">Use in any way that violates applicable laws or regulations.</li>
						<li className="mb-2">
							Use in projects that promote discrimination, illegal activities, or harmful content.
						</li>
						<li className="mb-2">Incorporation into logos or trademarks without additional permission.</li>
					</ul>

					<h2 className="text-2xl font-bold mt-8 mb-4">License Upgrades</h2>
					<p className="mb-4">
						You can upgrade to an Unlimited Access license at any time to gain full access to all premium assets.
					</p>
					<div className="flex justify-center my-8">
						<Link href="/upgrade" className="px-6 py-3 bg-black text-white  hover:bg-gray-800 transition-colors">
							Upgrade to Unlimited Access
						</Link>
					</div>

					<h2 className="text-2xl font-bold mt-8 mb-4">License Changes</h2>
					<p className="mb-4">
						Funnnit reserves the right to modify this license agreement at any time. Any changes will be effective
						immediately upon posting on our website. Your continued use of our assets after any changes constitutes
						acceptance of the modified license terms.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Contact</h2>
					<p className="mb-4">
						If you have any questions about this license, please contact us at:{" "}
						<a href="mailto:asticosmo@gmail.com" className="text-blue-600 hover:underline">
							asticosmo@gmail.com
						</a>
					</p>

					<div className="mt-8 text-sm text-gray-500">Last Updated: March 15, 2025</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
