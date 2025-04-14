"use cache";

import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default async function PrivacyPage() {
	return (
		<div className="flex-grow py-12">
			<MaxWidthWrapper className="max-w-4xl">
				<h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

				<div className="prose max-w-none">
					<p className="text-lg mb-6">
						At Funnnit, we take your privacy seriously. This Privacy Policy
						explains how we collect, use, and protect your personal information
						when you use our website.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">
						Information We Collect
					</h2>
					<p className="mb-4">
						We collect information that you provide directly to us, such as when
						you create an account, subscribe to our service, or contact us. This
						may include:
					</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">Your name and email address</li>
						<li className="mb-2">
							Billing information (if you purchase a subscription)
						</li>
						<li className="mb-2">Account preferences and settings</li>
						<li className="mb-2">Communications you send to us</li>
					</ul>

					<p className="mb-4">
						We also automatically collect certain information when you visit our
						website, including:
					</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">
							Log information (IP address, browser type, pages viewed)
						</li>
						<li className="mb-2">Device information</li>
						<li className="mb-2">Cookie and tracking technology data</li>
					</ul>

					<h2 className="text-2xl font-bold mt-8 mb-4">
						How We Use Your Information
					</h2>
					<p className="mb-4">We use the information we collect to:</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">
							Provide, maintain, and improve our services
						</li>
						<li className="mb-2">
							Process transactions and send related information
						</li>
						<li className="mb-2">
							Send technical notices, updates, and administrative messages
						</li>
						<li className="mb-2">Respond to your comments and questions</li>
						<li className="mb-2">Monitor and analyze trends and usage</li>
						<li className="mb-2">Personalize your experience</li>
					</ul>

					<h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
					<p className="mb-4">
						We implement appropriate security measures to protect your personal
						information. However, no method of transmission over the Internet is
						100% secure, and we cannot guarantee absolute security.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Services</h2>
					<p className="mb-4">
						Our website may contain links to third-party websites or services
						that are not owned or controlled by Funnnit. We have no control over
						and assume no responsibility for the content, privacy policies, or
						practices of any third-party websites or services.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">
						Changes to This Policy
					</h2>
					<p className="mb-4">
						We may update this Privacy Policy from time to time. We will notify
						you of any changes by posting the new Privacy Policy on this page
						and updating the "Last Updated" date at the top of this page.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
					<p className="mb-4">
						If you have any questions about this Privacy Policy, please contact
						us at:
						<a
							href="mailto:asticosmo@gmail.com"
							className="text-blue-600 hover:underline ml-1"
						>
							asticosmo@gmail.com
						</a>
					</p>

					<div className="mt-8 text-sm text-gray-500">
						Last Updated: March 15, 2025
					</div>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
