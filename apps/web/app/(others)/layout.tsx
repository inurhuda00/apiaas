import { Fragment } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Fragment>
			<Header />
			<main className="flex-grow flex flex-col">{children}</main>
			<Footer />
		</Fragment>
	);
}
