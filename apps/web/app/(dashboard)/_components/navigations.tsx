"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Icons } from "@/components/ui/icons";
export default function Navigation() {
	const pathname = usePathname();

	const navItems = [
		{ href: "/overview", icon: Icons.Overview, label: "Overview" },
		{ href: "/settings/general", icon: Icons.Settings, label: "General" },
		{ href: "/settings/security", icon: Icons.Security, label: "Security" },
	];

	return (
		<Fragment>
			<aside className="w-64 bg-card border border-border hidden md:block">
				<nav className="h-full overflow-y-auto p-4">
					{navItems.map((item) => (
						<Link key={item.href} href={item.href} passHref>
							<Button
								variant="ghost"
								className={`shadow-none my-1 w-full justify-start ${pathname === item.href ? "bg-accent" : ""}`}
							>
								<item.icon className="mr-2 h-4 w-4 text-primary" />
								{item.label}
							</Button>
						</Link>
					))}
				</nav>
			</aside>
			<aside className="block md:hidden space-x-2">
				{navItems.map((item) => (
					<Link key={item.href} href={item.href} passHref>
						<Button variant={pathname === item.href ? "secondary" : "ghost"}>
							<item.icon className="mr-2 h-4 w-4 text-primary" />
							{item.label}
						</Button>
					</Link>
				))}
			</aside>
		</Fragment>
	);
}
