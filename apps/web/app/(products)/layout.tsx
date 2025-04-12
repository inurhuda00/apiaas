"use client";

import { Fragment, useState } from "react";
import { Header } from "@/components/layout/header";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Fragment>
			<Header />
			<main className="flex-grow flex flex-col">
				<MaxWidthWrapper className="flex flex-col min-h-[calc(100dvh-68px)]">
					<div className="flex flex-1 overflow-hidden h-full">
						<main className="flex-1 overflow-y-auto p-0 lg:p-4">
							{children}
						</main>
					</div>
				</MaxWidthWrapper>
			</main>
		</Fragment>
	);
}
