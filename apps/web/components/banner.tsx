import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function UnlimitedAccess() {
	return (
		<div className="bg-card p-8 md:p-10 relative overflow-hidden border">
			<div className="grid md:grid-cols-2 gap-8 items-center">
				<div className="text-center md:text-left">
					<h2 className="text-3xl font-bold text-card-foreground mb-2">Unlimited Access</h2>
					<p className="text-muted-foreground mb-6">Access all assets with lifetime license</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
						<Link href="/upgrade">
							<Button>Get Unlimited Access</Button>
						</Link>
					</div>
					<p className="text-xs text-muted-foreground mt-4">Prices will increment with new addition</p>
				</div>
				<div className="flex justify-center md:justify-end">
					<div className="relative w-60 h-60">
						<Image
							src="https://ext.same-assets.com/2551241482/3090076002.png"
							alt="Unlimited Access"
							fill
							className="object-contain"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
