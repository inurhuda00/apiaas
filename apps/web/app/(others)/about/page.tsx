"use cache";

import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default async function AboutPage() {
	return (
		<div className="flex-grow py-12">
			<MaxWidthWrapper className="max-w-4xl">
				<h1 className="text-3xl font-bold mb-8">About Funnnit</h1>

				<div className="prose max-w-none">
					<p className="text-lg mb-6">
						Funnnit is a creative platform that provides quirky and fun graphic assets for everyone. Our mission is to
						help people add personality and uniqueness to their personal and commercial projects.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
					<p className="mb-4">
						Funnnit was born out of a passion for creativity and a desire to bring more joy and fun to design. Our
						founder, Superoutman, noticed a gap in the market for quirky, personality-filled graphics that could be
						easily used in various projects.
					</p>
					<p className="mb-4">
						What started as a small collection of doodles has now grown into a vibrant platform offering hundreds of
						assets across multiple categories, including 2D doodles and 3D graphics.
					</p>

					<h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
					<p className="mb-4">
						At Funnnit, we believe that creativity should be accessible to everyone. Our mission is to provide
						high-quality, unique, and fun graphics that can be used by designers, content creators, and businesses of
						all sizes.
					</p>
					<p className="mb-4">We are committed to:</p>
					<ul className="list-disc pl-6 mb-6">
						<li className="mb-2">Creating original, high-quality graphics that stand out</li>
						<li className="mb-2">Making creative assets accessible with both free and premium options</li>
						<li className="mb-2">Continuously expanding our collection with new and exciting designs</li>
						<li className="mb-2">Supporting creators and businesses in expressing their unique personalities</li>
					</ul>

					<h2 className="text-2xl font-bold mt-8 mb-4">Join Us</h2>
					<p className="mb-4">
						Whether you're a designer looking for unique assets, a business wanting to add personality to your brand, or
						just someone who appreciates quirky art, Funnnit is here for you.
					</p>
					<p className="mb-4">
						Explore our growing collection, sign up for unlimited access, or just enjoy some of our free assets. We're
						excited to be part of your creative journey!
					</p>
				</div>
			</MaxWidthWrapper>
		</div>
	);
}
