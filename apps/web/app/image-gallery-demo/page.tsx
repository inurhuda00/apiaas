import { ProductDetailExample } from "@/components/product-detail-example";

export const metadata = {
	title: "Image Gallery Demo",
	description: "A demonstration of the image gallery component for multiple image viewing",
};

export default function ImageGalleryDemoPage() {
	return (
		<div className="py-8">
			<div className="container mx-auto px-4">
				<h1 className="text-2xl font-bold mb-6 text-center">Image Gallery Demo</h1>
				<p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
					This page demonstrates the image gallery component with detailed background view for multiple images. Click on
					thumbnails to switch the main image or click the expand icon to view in fullscreen mode.
				</p>

				<ProductDetailExample />
			</div>
		</div>
	);
}
