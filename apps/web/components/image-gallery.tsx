"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import type { Image as ImageType } from "@apiaas/db/schema";

// Workaround for MD icons not recognized in TS
import { MdImage, MdFullscreen } from "react-icons/md";

type ImageGalleryProps = {
	images: Pick<ImageType, "id" | "url">[];
	alt?: string;
	className?: string;
	thumbnailClassName?: string;
	aspectRatio?: string;
};

export function ImageGallery({
	images,
	alt = "Product image",
	className,
	thumbnailClassName,
	aspectRatio = "aspect-[1.7867/1]",
}: ImageGalleryProps) {
	const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
	const [isOpen, setIsOpen] = React.useState(false);

	// No images case
	if (!images.length) {
		return (
			<div className={cn("bg-gray-100 rounded-lg flex items-center justify-center", aspectRatio, className)}>
				<MdImage className="h-10 w-10 text-gray-400" />
			</div>
		);
	}

	// Single image case
	if (images.length === 1) {
		return (
			<div className={cn("relative overflow-hidden rounded-lg", aspectRatio, className)}>
				<Image
					src={images[0].url}
					alt={alt}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className="object-cover"
				/>
			</div>
		);
	}

	// Multiple images case
	return (
		<>
			<div className={cn("relative overflow-hidden rounded-lg", aspectRatio, className)}>
				<Image
					src={images[selectedImageIndex].url}
					alt={alt}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className="object-cover"
				/>
				<Button
					variant="ghost"
					size="icon"
					className="absolute bottom-2 right-2 bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm"
					onClick={() => setIsOpen(true)}
				>
					<MdFullscreen className="h-5 w-5" />
				</Button>
			</div>

			{/* Thumbnail row */}
			<div className="flex space-x-2 mt-2 overflow-x-auto pb-2">
				{images.map((image, index) => (
					<button
						type="button"
						key={image.id}
						onClick={() => setSelectedImageIndex(index)}
						className={cn(
							"relative overflow-hidden rounded-md h-16 w-16 flex-shrink-0 cursor-pointer border-2",
							index === selectedImageIndex ? "border-primary" : "border-transparent",
							thumbnailClassName,
						)}
					>
						<Image src={image.url} alt={`${alt} thumbnail ${index + 1}`} fill sizes="64px" className="object-cover" />
					</button>
				))}
			</div>

			{/* Full screen image view */}
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetContent side="bottom" className="h-[90vh] p-0 bg-black/90 backdrop-blur-md">
					<div className="relative h-full w-full">
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 z-10 text-white bg-black/30 hover:bg-black/50"
							onClick={() => setIsOpen(false)}
						>
							<Icons.X className="h-5 w-5" />
						</Button>

						<Carousel className="h-full">
							<CarouselContent className="h-full">
								{images.map((image, index) => (
									<CarouselItem key={image.id} className="h-full flex items-center justify-center">
										<div className="relative h-full w-full">
											<Image
												src={image.url}
												alt={`${alt} ${index + 1}`}
												fill
												sizes="100vw"
												className="object-contain"
											/>
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselPrevious className="left-4 text-white bg-black/30 hover:bg-black/50" />
							<CarouselNext className="right-4 text-white bg-black/30 hover:bg-black/50" />
						</Carousel>

						{/* Thumbnail strip at the bottom */}
						<div className="absolute bottom-4 left-0 right-0 flex justify-center">
							<div className="flex space-x-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
								{images.map((image, index) => (
									<button
										type="button"
										key={image.id}
										onClick={() => {
											const carouselApi = document.querySelector("[data-embla-api]");
											if (carouselApi) {
												// @ts-ignore - Using dataset API
												carouselApi.emblaApi?.scrollTo(index);
											}
										}}
										className={cn(
											"relative overflow-hidden rounded-md h-10 w-10 flex-shrink-0 cursor-pointer border-2",
											index === selectedImageIndex ? "border-white" : "border-transparent",
										)}
									>
										<Image
											src={image.url}
											alt={`${alt} thumbnail ${index + 1}`}
											fill
											sizes="40px"
											className="object-cover"
										/>
									</button>
								))}
							</div>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
