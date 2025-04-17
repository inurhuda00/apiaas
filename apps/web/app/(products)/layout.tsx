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
			<MaxWidthWrapper className="flex flex-col max-w-5xl min-h-[calc(100dvh-68px) p-6">{children}</MaxWidthWrapper>
		</Fragment>
	);
}
