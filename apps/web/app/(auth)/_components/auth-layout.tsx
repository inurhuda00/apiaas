import Image from "next/image";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";

interface AuthLayoutProps {
	children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen">
			{/* Left side - Auth form */}
			<div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
				<div className="mx-auto w-full max-w-sm lg:w-96">
					<div className="mb-8">
						<Link href="/" className="flex items-center gap-1">
							<Icons.LogoIcon className="h-8 w-8 -mr-3 text-primary" />
							<span className="font-bold text-lg text-foreground">Mondive</span>
						</Link>
					</div>
					{children}
				</div>
			</div>

			{/* Right side - Image */}
			<div className="relative hidden w-0 flex-1 lg:block">
				<div className="absolute inset-0 h-full w-full bg-gradient-to-br from-accent to-background">
					<div className="absolute inset-0 flex items-center justify-center p-12">
						<div className="max-w-2xl">
							<Image
								src="/auth-illustration.svg"
								alt="Authentication illustration"
								width={600}
								height={600}
								className="w-full h-auto"
								priority
							/>
							<div className="mt-8 text-center">
								<h2 className="text-2xl font-bold text-foreground">Create with Mondive</h2>
								<p className="text-sm text-muted-foreground mt-2 mb-8 max-w-sm mx-auto">
									Join our community and get access to thousands of creative assets
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
