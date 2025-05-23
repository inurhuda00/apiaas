"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import type { ActionState } from "@/actions/middleware";
import { signUp } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import Form from "next/form";

export function SignUpForm() {
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");
	const priceId = searchParams.get("priceId");
	const inviteId = searchParams.get("inviteId");
	const [state, formAction, pending] = useActionState<ActionState, FormData>(signUp, { error: "" });

	return (
		<Form action={formAction} className="space-y-4">
			<input type="hidden" name="redirect" value={redirect || ""} />
			<input type="hidden" name="priceId" value={priceId || ""} />
			<input type="hidden" name="inviteId" value={inviteId || ""} />
			<div>
				<Label htmlFor="name">Full name</Label>
				<Input id="name" name="name" type="text" autoComplete="name" className="mt-1" />
			</div>

			<div>
				<Label htmlFor="email">Email address</Label>
				<Input id="email" name="email" type="email" autoComplete="email" className="mt-1" />
			</div>

			<div>
				<Label htmlFor="password">Password</Label>
				<Input id="password" name="password" type="password" autoComplete="new-password" className="mt-1" />
				<p className="mt-1 text-xs text-muted-foreground">Must be at least 8 characters</p>
			</div>

			{state.error && <div className="text-sm text-destructive font-medium">{state.error}</div>}

			<SubmitButton pending={pending}>Create account</SubmitButton>
		</Form>
	);
}
