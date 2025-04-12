import { Suspense } from "react";
import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import { ForgotPasswordForm } from "../_components/form-forgot-password";
import Link from "next/link";
import { Icons } from "@/components/ui/icons";

export const dynamic = "force-static";
export const revalidate = false;

export default function ForgotPasswordPage() {
	return (
		<div className="flex min-h-screen">
			<div className="flex flex-1 flex-col justify-center px-4 py-12">
				<div className="mx-auto w-full max-w-sm">
					<div className="mb-8">
						<Link href="/" className="flex items-center gap-2">
							<Icons.LogoIcon className="h-8 w-8 text-orange-500" />
							<span className="text-xl font-bold">Funnnit</span>
						</Link>
					</div>
					<AuthCard
						title="Reset Password"
						subtitle="Enter your email to receive a password reset link"
					>
						<Suspense>
							<ForgotPasswordForm />
						</Suspense>
					</AuthCard>
				</div>
			</div>
		</div>
	);
}
