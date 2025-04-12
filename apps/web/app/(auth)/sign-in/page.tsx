import { AuthCard } from "../_components/auth-card";
import { AuthFooter } from "../_components/auth-footer";
import { AuthLayout } from "../_components/auth-layout";
import { Suspense } from "react";
import { SignInForm } from "../_components/form-signin";

export const dynamic = "force-static";
export const revalidate = false;

export default function SignInPage() {
	return (
		<AuthLayout>
			<AuthCard
				title="Welcome back"
				subtitle="Sign in to your account to continue"
			>
				<Suspense>
					<SignInForm />
				</Suspense>

				<AuthFooter
					text="Don't have an account?"
					linkText="upgrade"
					linkHref="/upgrade"
				/>
			</AuthCard>
		</AuthLayout>
	);
}
