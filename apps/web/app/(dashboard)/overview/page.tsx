"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Fragment, use } from "react";
import Navigation from "../_components/navigations";
import { useUser } from "@/components/providers/auth";
import { Icons } from "@/components/ui/icons";

export default function OverviewPage() {
	const { userPromise } = useUser();
	const user = use(userPromise);

	return (
		<Fragment>
			<h1 className="text-lg lg:text-2xl font-medium text-primary mb-6">
				Overview
			</h1>
			<div className="md:flex items-start gap-6 grid">
				<Navigation />
				<main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
					{user?.role === "admin" ? (
						<Card className="md:col-span-2">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Icons.FileUpload className="h-5 w-5 text-green-500" />
									Upload Asset
								</CardTitle>
								<CardDescription>
									Your most recent product upload
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-gray-500">Total assets: 3</p>
								<p className="text-sm text-gray-500">
									Recent Upload At: 05/08/2020
								</p>
								<Button asChild className="mt-4" variant="outline">
									<Link href="/upload">Upload New</Link>
								</Button>
							</CardContent>
						</Card>
					) : null}

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Icons.Person className="h-5 w-5 text-blue-500" />
								Design Request
							</CardTitle>
							<CardDescription>Manage your support tickets</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-500">Open tickets: 3</p>
							<p className="text-sm text-gray-500">Last updated: Today</p>
							<Button className="mt-4" variant="outline">
								View All
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Icons.ExternalLink className="h-5 w-5 text-orange-500" />
								Customer Portal
							</CardTitle>
							<CardDescription>
								Quick access to customer resources
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-500">
								Access your customer portal for billing, support, and more
							</p>
							{["free"].includes(user?.role || "") ? (
								<Button
									asChild
									variant="default"
									className="text-sm font-medium mt-4"
								>
									<Link href="/upgrade">Unlimited Access</Link>
								</Button>
							) : (
								<Button className="mt-4" variant="outline">
									Go to Portal
								</Button>
							)}
						</CardContent>
					</Card>
				</main>
			</div>
		</Fragment>
	);
}
