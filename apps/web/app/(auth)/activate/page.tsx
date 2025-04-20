import { Icons } from "@/components/ui/icons";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import Link from "next/link";
import { ActivateForm } from "../_components/form-activate";
import { Suspense } from "react";

export const dynamic = "force-static";
export const revalidate = false;

export default function ActivatePage() {
	return (
		<div className="flex min-h-screen">
			<div className="flex flex-1 flex-col justify-center px-4 py-12">
				<div className="mx-auto w-full max-w-sm">
					<div className="mb-8">
						<Link href="/" className="flex items-center gap-2">
							<Icons.LogoIcon className="h-8 w-8 text-orange-500" />
							<span className="text-xl font-bold">Mondive</span>
						</Link>
					</div>
					<AuthCard
						title="Activate Your Account"
						subtitle="Set a password to activate your account"
						className="text-center"
					>
						<Suspense>
							<ActivateForm />
						</Suspense>
						<AuthFooter text="Already have an account?" linkText="Sign in" linkHref="/sign-in" />
					</AuthCard>
				</div>
			</div>
		</div>
	);
}
