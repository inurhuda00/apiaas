"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/actions/middleware";
import { forgotPassword } from "@/actions/auth";
import { useActionState } from "react";
import { cn } from "@/lib/utils/cn";
import Form from "next/form";

export function ForgotPasswordForm() {
	const [state, formAction, pending] = useActionState<ActionState, FormData>(forgotPassword, {});

	return (
		<Form action={formAction} className="space-y-4">
			<div className={cn({ "opacity-0": state.success })}>
				<Label htmlFor="email">Email address</Label>
				<Input
					id="email"
					name="email"
					type={state.success ? "hidden" : "email"}
					autoComplete="email"
					className="mt-1"
					placeholder="your@email.com"
					defaultValue={state.email}
				/>
			</div>

			{state.error && <div className="text-sm text-destructive font-medium">{state.error}</div>}

			{state.success && !pending && (
				<>
					<div className="text-sm text-green-500 font-medium">{state.success}</div>
					<div className="text-sm text-green-500 font-medium">
						If you don't see the email, check your spam folder or request another link below.
					</div>
				</>
			)}

			<SubmitButton pending={pending}>Send Reset Link</SubmitButton>
		</Form>
	);
}
