import { Fragment } from "react";
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
			<div className="flex-grow flex flex-col">
				<MaxWidthWrapper className="flex flex-col min-h-[calc(100dvh-68px)] p-6">
					{children}
				</MaxWidthWrapper>
			</div>
		</Fragment>
	);
}
