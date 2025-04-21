"use client";

import Link from "next/link";
import { useUser } from "@/components/providers/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Fragment, use, useState } from "react";
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
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";

export function Header() {
	const { userPromise } = useUser();
	const user = use(userPromise);
	const [isOpen, setIsOpen] = useState(false);

	const navItems = [
		{ href: "/3dx", label: "3DX" },
		{ href: "/joydoodle", label: "Joydoodle" },
		{ href: "/3dx", label: "Affiliate", badge: "40%" },
		{ href: "/3dx", label: "Request" },
		{ href: "/3dx", label: "Changelog" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<MaxWidthWrapper>
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-4 md:gap-8">
						<Link href="/" className="flex items-center gap-1">
							<Icons.LogoIcon className="h-8 w-8 text-primary" />
							<span className="font-bold text-lg text-foreground">Mondive</span>
						</Link>

						<nav className="hidden md:flex items-center gap-6">
							<NavigationMenu className="-mr-3">
								<NavigationMenuList>
									<NavigationMenuItem>
										<NavigationMenuTrigger className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground">
											Categories
										</NavigationMenuTrigger>
										<NavigationMenuContent>
											<ul className="py-1">
												<Link href="/3dx" className={buttonVariants({ variant: "link" })}>
													3DX
												</Link>
												<Link href="/joydoodle" className={buttonVariants({ variant: "link" })}>
													Joydoodle
												</Link>
											</ul>
										</NavigationMenuContent>
									</NavigationMenuItem>
								</NavigationMenuList>
							</NavigationMenu>
							<Link href="/3dx" className={cn(buttonVariants({ variant: "link" }), "px-0")}>
								Affiliate
								<Badge variant="tag" className="ml-2">
									40%
								</Badge>
							</Link>
							<Link href="/3dx" className={cn(buttonVariants({ variant: "link" }), "px-0")}>
								Request
							</Link>
							<Link href="/3dx" className={cn(buttonVariants({ variant: "link" }), "px-0")}>
								Changelog
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-2 md:gap-4">
						<button
							type="button"
							className="p-2 text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Search"
						>
							<Icons.Search className="size-5" />
						</button>

						{/* Desktop buttons */}
						{user ? (
							<UserInfo user={user} />
						) : (
							<div className="hidden md:flex items-center gap-2">
								<Link href="/sign-in">
									<Button variant="ghost" size="sm" className="text-sm font-medium md:size-auto">
										Sign In
									</Button>
								</Link>
								<Link href="/upgrade" className="hidden md:block">
									<Button variant="default" size="sm" className="text-xs sm:text-sm font-medium whitespace-nowrap">
										Unlimited Access
									</Button>
								</Link>
							</div>
						)}

						{/* Mobile menu */}
						{!user && (
							<div className="md:hidden">
								<Sheet open={isOpen} onOpenChange={setIsOpen}>
									<SheetTrigger asChild>
										<Button variant="ghost" size="icon" className="md:hidden">
											<Icons.MoreHoriz className="h-5 w-5" aria-hidden="true" />
											<span className="sr-only">Toggle menu</span>
										</Button>
									</SheetTrigger>
									<SheetContent side="right" className="p-0">
										<div className="flex flex-col h-full">
											<div className="p-4 border-b">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Icons.LogoIcon className="h-6 w-6 text-primary" />
														<span className="font-bold text-base text-foreground">Mondive</span>
													</div>
													<SheetClose asChild>
														<Button variant="ghost" size="icon">
															<Icons.X className="h-4 w-4" />
														</Button>
													</SheetClose>
												</div>
											</div>
											<div className="flex-1 overflow-auto py-6 px-4">
												<div className="space-y-1">
													{navItems.map((item) => (
														<SheetClose asChild key={item.label}>
															<Link
																href={item.href}
																className="flex items-center px-4 py-3 text-sm hover:bg-accent rounded-md transition-colors"
															>
																{item.label}
																{item.badge && (
																	<Badge variant="tag" className="ml-2">
																		{item.badge}
																	</Badge>
																)}
															</Link>
														</SheetClose>
													))}
												</div>
											</div>
											<div className="p-4 border-t mt-auto">
												<div className="grid gap-3">
													<SheetClose asChild>
														<Link href="/sign-in">
															<Button variant="outline" className="w-full justify-center text-sm font-medium">
																Sign In
															</Button>
														</Link>
													</SheetClose>
													<SheetClose asChild>
														<Link href="/upgrade">
															<Button variant="default" className="w-full justify-center text-sm font-medium">
																Unlimited Access
															</Button>
														</Link>
													</SheetClose>
												</div>
											</div>
										</div>
									</SheetContent>
								</Sheet>
							</div>
						)}
					</div>
				</div>
			</MaxWidthWrapper>
		</header>
	);
}
