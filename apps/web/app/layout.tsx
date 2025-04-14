import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { UserProvider } from "@/components/providers/auth";
import { ThemeProvider } from "@/lib/utils/theme";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import NextTopLoader from "nextjs-toploader";
import { getAccessToken, getAuthenticatedUser } from "@/lib/auth/session";
import { SessionProvider } from "@/components/providers/session";

export const metadata: Metadata = {
	title: "Next.js SaaS Starter",
	description: "Get started quickly with Next.js, Postgres, and Stripe.",
};

export const viewport: Viewport = {
	maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const userPromise = getAuthenticatedUser();
	const sessionPromise = getAccessToken();

	return (
		<html lang="en" className={`${manrope.className}`} suppressHydrationWarning>
			<body className="min-h-[100dvh] bg-background text-foreground flex flex-col antialiased">
				<ThemeProvider
					enableSystem
					attribute="class"
					defaultTheme="light"
					themes={["light", "dark"]}
				>
					<NextTopLoader
						initialPosition={0.08}
						crawlSpeed={200}
						height={4}
						crawl={true}
						easing="ease"
						speed={200}
						shadow="0 0 10px #2299DD,0 0 5px #2299DD"
						color="var(--primary)"
						showSpinner={false}
					/>
					<Toaster />
					<SessionProvider sessionPromise={sessionPromise}>
						<UserProvider userPromise={userPromise}>
							{children}
						</UserProvider>
					</SessionProvider>
				</ThemeProvider>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
