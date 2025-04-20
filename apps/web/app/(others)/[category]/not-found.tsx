import Link from "next/link";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex items-center justify-center min-h-[calc(100dvh-24.5rem)]">
			<div className="max-w-md space-y-8 p-4 text-center">
				<div className="flex justify-center">
					<Icons.LogoIcon className="size-12 text-primary" />
				</div>
				<h1 className="text-4xl font-bold text-foreground tracking-tight">Page Not Found</h1>
				<p className="text-base text-muted-foreground">
					The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
				</p>
				<Button variant="outline" asChild className="max-w-48 mx-auto">
					<Link href="/">Back to Home</Link>
				</Button>
			</div>
		</div>
	);
}
