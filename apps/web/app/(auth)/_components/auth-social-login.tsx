"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";

interface SocialLoginProps {
	text?: string;
}

export function SocialLogin({ text = "Or continue with" }: SocialLoginProps) {
	return (
		<div className="mt-6">
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator className="w-full" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-2 bg-white text-gray-500">{text}</span>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-1 gap-3">
				<Button variant="outline" className="w-full" onClick={() => {}}>
					<Icons.Google className="mr-2 h-4 w-4" />
					Google
				</Button>
			</div>
		</div>
	);
}
