"use client";

import { useUser } from "@/components/providers/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { env } from "@/env";
import type { Product } from "@apiaas/db/schema";
import Link from "next/link";
import { Fragment, use } from "react";
import { cn } from "@/lib/utils/cn";

const API_BASE_URL = env.NEXT_PUBLIC_BACKEND_URL;

export default function ProductButton({
	product,
}: { product: Pick<Product, "id" | "locked"> & { files: { fileName: string }[] } }) {
	const { userPromise } = useUser();
	const user = use(userPromise);

	const loggedIn = user !== null;
	const isPro = loggedIn && ["pro", "admin"].includes(user.role);
	
	const canDownload = !product.locked || isPro;
	
	const showUpgrade = loggedIn && product.locked && !isPro;

	return (
		<Fragment>
			{canDownload && (
				<div className="space-y-2 md:space-y-4 mt-4">
					<div className="p-4 md:p-5 bg-muted/50 border">
						<Link
							href={`${API_BASE_URL}/v1/product/files/download/${product.id}/${product.files[0]?.fileName}`}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								buttonVariants({ variant: "default" }),
								"w-full text-sm md:text-base",
							)}
						>
							<Icons.Download className="mr-2" />
							Download {isPro ? "Premium" : "Free"} Asset
						</Link>
						<div className="mt-2 md:mt-3 text-center">
							<p className="text-xs md:text-sm text-muted-foreground">
								{isPro ? "Pro member access. Unlimited usage rights." : "Lifetime license • One-time payment"}
							</p>
							{!isPro && <p className="text-xs text-muted-foreground/80 mt-1">Free asset download</p>}
						</div>
					</div>
				</div>
			)}

			{showUpgrade && (
				<div className="space-y-3 md:space-y-4 mt-4">
					<div className="p-4 md:p-5 bg-muted/50 border">
						<div className="flex items-center gap-2 mb-3 md:mb-4">
							<Icons.Security className="text-muted-foreground" />
							<h3 className="font-medium text-sm">Premium Asset</h3>
						</div>
						<Link href="/upgrade">
							<Button className="w-full text-sm md:text-base" type="button">
								Get Unlimited Access
							</Button>
						</Link>
						<div className="mt-2 md:mt-3 text-center">
							<p className="text-xs md:text-sm text-muted-foreground">Lifetime license • One-time payment</p>
							<p className="text-xs text-muted-foreground/80 mt-1">Includes all premium assets</p>
						</div>
					</div>
				</div>
			)}

			{!loggedIn && product.locked && (
				<div className="space-y-3 md:space-y-4 mt-4">
					<div className="p-4 md:p-5 bg-muted/50 border">
						<div className="flex items-center gap-2 mb-3 md:mb-4">
							<Icons.Security className="text-muted-foreground" />
							<h3 className="font-medium text-sm">Premium Asset</h3>
						</div>
						<Link href="/upgrade">
							<Button className="w-full text-sm md:text-base" type="button">
								Get Unlimited Access
							</Button>
						</Link>
						<div className="mt-2 md:mt-3 text-center">
							<p className="text-xs md:text-sm text-muted-foreground">Lifetime license • One-time payment</p>
							<p className="text-xs text-muted-foreground/80 mt-1">Includes all premium assets</p>
						</div>
					</div>
				</div>
			)}
		</Fragment>
	);
}
