"use client";

import * as React from "react";
import { ImageGallery } from "./image-gallery";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

// Sample product data with multiple images - using number type for id to match the schema
const sampleProduct = {
	id: "1",
	name: "Sample Product",
	description: "This is a sample product that demonstrates the image gallery functionality.",
	price: "29.99",
	images: [
		{ id: 1, url: "https://source.unsplash.com/random/800x600?product=1" },
		{ id: 2, url: "https://source.unsplash.com/random/800x600?product=2" },
		{ id: 3, url: "https://source.unsplash.com/random/800x600?product=3" },
		{ id: 4, url: "https://source.unsplash.com/random/800x600?product=4" },
		{ id: 5, url: "https://source.unsplash.com/random/800x600?product=5" },
	],
};

export function ProductDetailExample() {
	return (
		<MaxWidthWrapper>
			<div className="py-8">
				<h1 className="text-3xl font-bold mb-6">{sampleProduct.name}</h1>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Image Gallery */}
					<div>
						<ImageGallery
							images={sampleProduct.images}
							alt={sampleProduct.name}
							aspectRatio="aspect-square"
							className="w-full"
						/>
					</div>

					{/* Product Details */}
					<div className="space-y-4">
						<p className="text-xl font-semibold">${sampleProduct.price}</p>
						<p className="text-gray-600">{sampleProduct.description}</p>

						<div className="pt-4">
							<Button className="w-full">
								<Icons.Download className="mr-2 h-4 w-4" />
								Purchase Now
							</Button>
						</div>

						<div className="pt-2">
							<Button variant="outline" className="w-full">
								<Icons.Add className="mr-2 h-4 w-4" />
								Add to Cart
							</Button>
						</div>
					</div>
				</div>
			</div>
		</MaxWidthWrapper>
	);
}
