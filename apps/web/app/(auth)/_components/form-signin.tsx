"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import type { ActionState } from "@/actions/middleware";
import { signIn } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import Form from "next/form";

export function SignInForm() {
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");
	const priceId = searchParams.get("priceId");
	const inviteId = searchParams.get("inviteId");
	const [state, formAction, pending] = useActionState<ActionState, FormData>(
		signIn,
		{},
	);
	return (
		<Form action={formAction} className="space-y-4">
			<input type="hidden" name="redirect" value={redirect || ""} />
			<input type="hidden" name="priceId" value={priceId || ""} />
			<input type="hidden" name="inviteId" value={inviteId || ""} />
			<div>
				<Label htmlFor="email">Email address</Label>
				<Input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					defaultValue={state.email}
					placeholder="yo.u@example.com"
					className="mt-1"
				/>
			</div>

			<div>
				<div className="flex items-center justify-between">
					<Label htmlFor="password">Password</Label>
					<Link
						href="/forgot-password"
						className="text-xs font-medium text-orange-600 hover:text-orange-500"
					>
						Forgot password?
					</Link>
				</div>
				<Input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					placeholder="••••••••"
					className="mt-1"
				/>
			</div>

			{state.error && (
				<div className="text-sm text-red-500 font-medium">{state.error}</div>
			)}

			<SubmitButton pending={pending}>Sign in</SubmitButton>
		</Form>
	);
}
