"use client";

import Link from "next/link";
import { useUser } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Fragment, use } from "react";
import { UserInfo } from "../user-info";
import { MaxWidthWrapper } from "../max-width-wrapper";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils/cn";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "../ui/navigation-menu";

export function Header() {
	const { userPromise } = useUser();
	const user = use(userPromise);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<MaxWidthWrapper>
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-8">
						<Link href="/" className="flex items-center gap-2">
							<Icons.LogoIcon className="h-6 w-6 text-foreground" />
							<span className="font-bold text-lg text-foreground">Funnnit</span>
						</Link>

						<nav className="hidden md:flex items-center gap-6">
							<NavigationMenu className="-mr-3">
								<NavigationMenuList>
									<NavigationMenuItem>
										<NavigationMenuTrigger className="border">
											Categories
										</NavigationMenuTrigger>
										<NavigationMenuContent>
											<ul className="py-1">
												<Link
													href="/3dx"
													className={buttonVariants({ variant: "link" })}
												>
													3DX
												</Link>
												<Link
													href="/joydoodle"
													className={buttonVariants({ variant: "link" })}
												>
													Joydoodle
												</Link>
											</ul>
										</NavigationMenuContent>
									</NavigationMenuItem>
								</NavigationMenuList>
							</NavigationMenu>
							<Link
								href="/3dx"
								className={cn(buttonVariants({ variant: "link" }), "px-0")}
							>
								Affiliate
								<Badge variant="tag" className="ml-2">
									40%
								</Badge>
							</Link>
							<Link
								href="/3dx"
								className={cn(buttonVariants({ variant: "link" }), "px-0")}
							>
								Request
							</Link>
							<Link
								href="/3dx"
								className={cn(buttonVariants({ variant: "link" }), "px-0")}
							>
								Changelog
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-4">
						<button
							type="button"
							className="p-2 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Search"
						>
							<Icons.Search className="size-5" />
						</button>

						{user ? (
							<UserInfo user={user} />
						) : (
							<Fragment>
								<Link href="/sign-in">
									<Button variant="ghost" className="text-sm font-medium">
										Sign In
									</Button>
								</Link>
								<Link href="/upgrade">
									<Button variant="default" className="text-sm font-medium">
										Unlimited Access
									</Button>
								</Link>
							</Fragment>
						)}
					</div>
				</div>
			</MaxWidthWrapper>
		</header>
	);
}
