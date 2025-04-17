import Link from "next/link";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import ThemeSwitcher from "@/components/theme-switcher";
import { Suspense } from "react";

export function Footer() {
	return (
		<footer className="border-border border-t bg-background">
			<MaxWidthWrapper>
				<div className="py-12">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Brand Section */}
						<div className="space-y-4">
							<Link href="/" className="flex items-center gap-2">
								<Icons.LogoIcon className="h-6 w-6 text-foreground" />
								<span className="font-bold text-lg text-foreground">Funnnit</span>
							</Link>
							<p className="text-muted-foreground">Exploring art for Fun</p>
						</div>

						{/* Info Section */}
						<div>
							<h3 className="font-medium mb-4 inline-flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground text-sm">
								Info
							</h3>
							<nav className="space-y-3 text-sm">
								<Link href="/about" className="block text-foreground hover:text-primary transition-colors">
									About
								</Link>
								<Link href="/license" className="block text-foreground hover:text-primary transition-colors">
									License
								</Link>
								<Link href="/contact" className="block text-foreground hover:text-primary transition-colors">
									Contact
								</Link>
								<Link href="/privacy" className="block text-foreground hover:text-primary transition-colors">
									Privacy Policy
								</Link>
							</nav>
						</div>

						<div>
							<h3 className="font-medium mb-4 inline-flex items-center gap-2 px-3 py-1 bg-muted text-muted-foreground text-sm">
								Account
							</h3>
							<nav className="space-y-3 text-sm">
								<Link href="/sign-in" className="block text-foreground hover:text-primary transition-colors">
									Sign In
								</Link>
								<Link href="/activate" className="block text-foreground hover:text-primary transition-colors">
									Activate
								</Link>
								<Link href="/reset-password" className="block text-foreground hover:text-primary transition-colors">
									Reset Password
								</Link>
								<Link
									href="/affiliate"
									className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
								>
									Affiliate
									<Badge variant="destructive">40%</Badge>
								</Link>
							</nav>
						</div>
					</div>
				</div>

				{/* Bottom Section */}
				<div className="flex items-center justify-between py-6 border-t border-border">
					<div className="flex items-center gap-2">
						<span className="w-2 h-2 bg-green-500" />
						<span className="text-sm text-muted-foreground">All systems operational</span>
					</div>

					<ThemeSwitcher />
				</div>
			</MaxWidthWrapper>
		</footer>
	);
}
