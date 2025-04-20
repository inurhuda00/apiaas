"use cache";

import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default async function AboutPage() {
	return (
		<div className="flex-grow py-12">
			<MaxWidthWrapper className="max-w-4xl">
				<h1 className="text-3xl font-bold mb-8">About Mondive</h1>

				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-4">Our Mission</h2>
					<p className="text-muted-foreground leading-relaxed mb-4">
						Mondive is a creative platform that provides quirky and fun graphic assets for everyone. Our mission is to
						make design more accessible, enjoyable, and unique by offering high-quality AI-generated backgrounds that
						help creators stand out.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-4">Our Story</h2>
					<p className="text-muted-foreground leading-relaxed">
						Mondive was born out of a passion for creativity and a desire to bring more joy and fun to design. Our
						team of designers and developers wanted to create a platform where anyone could find unique, eye-catching
						visuals without needing professional design skills or expensive software.
					</p>
				</section>

				<section className="mb-8">
					<h2 className="text-xl font-semibold mb-4">Our Values</h2>
					<div className="space-y-4">
						<div>
							<h3 className="font-medium">Accessibility</h3>
							<p className="text-muted-foreground leading-relaxed">
								At Mondive, we believe that creativity should be accessible to everyone. Our mission is to provide
								high-quality design assets that anyone can use, regardless of their design experience or budget.
							</p>
						</div>
						<div>
							<h3 className="font-medium">Quality</h3>
							<p className="text-muted-foreground leading-relaxed">
								We're committed to delivering premium AI-generated backgrounds that meet professional standards. Each
								asset is carefully created to ensure it's visually appealing and versatile.
							</p>
						</div>
						<div>
							<h3 className="font-medium">Creativity</h3>
							<p className="text-muted-foreground leading-relaxed">
								We celebrate originality and uniqueness. Our assets are designed to help you express your creativity
								and stand out from the crowd. Whether you're a professional designer, a social media enthusiast, or
								just someone who appreciates quirky art, Mondive is here for you.
							</p>
						</div>
					</div>
				</section>

				<div className="prose max-w-none">
					<h2 className="text-2xl font-bold mt-8 mb-4">Join Us</h2>
					<p className="mb-4">
						Whether you're a designer looking for unique assets, a business wanting to add personality to your brand, or
						just someone who appreciates quirky art, Mondive is here for you.
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
