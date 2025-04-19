"use client";
import { useUser } from "@/components/providers/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { env } from "@/env";
import type { Product } from "@apiaas/db/schema";
import Link from "next/link";
import { use } from "react";
import { cn } from "@/lib/utils/cn";

const API_BASE_URL = env.NEXT_PUBLIC_BACKEND_URL;

export default function ProductButton({
	product,
}: { product: Pick<Product, "id" | "locked"> & { files: { fileName: string }[] } }) {
	const { userPromise } = useUser();
	const user = use(userPromise);

	const canDownload = !product.locked || (user && ["pro", "admin"].includes(user.role));
	
	return canDownload ? (
		<div className="space-y-2 md:space-y-4">
			<Link
				href={`${API_BASE_URL}/v1/product/files/download/${product.id}/${product.files[0].fileName}`}
				type="button"
				className={cn(
					buttonVariants({ variant: "default" }),
					"w-full flex items-center justify-center gap-2 h-10 md:h-12 bg-black text-white hover:bg-gray-800 text-sm md:text-base",
					product.locked && "bg-gray-500 hover:bg-gray-500",
				)}
			>
				<Icons.Download />
				Download {!product.locked ? "Free" : "Premium"} Asset
			</Link>
			<p className="text-xs text-center text-gray-500">
				{!product.locked
					? "No login required. Free to use with attribution."
					: "Pro member access. Unlimited usage rights."}
			</p>
		</div>
	) : (
		<div className="space-y-3 md:space-y-4">
			<div className="p-4 md:p-5 bg-gray-50  border">
				<div className="flex items-center gap-2 mb-3 md:mb-4">
					<Icons.Security className="text-gray-400" />
					<h3 className="font-medium text-sm">Premium Asset</h3>
				</div>
				<Link href="/upgrade">
					<Button className="w-full bg-black text-white hover:bg-gray-800 text-sm md:text-base" type="button">
						Get Unlimited Access
					</Button>
				</Link>
				<div className="mt-2 md:mt-3 text-center">
					<p className="text-xs md:text-sm text-gray-600">Lifetime license • One-time payment</p>
					<p className="text-xs text-gray-500 mt-1">Includes all premium assets</p>
				</div>
			</div>
		</div>
	);
}
