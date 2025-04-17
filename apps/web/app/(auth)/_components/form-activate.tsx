"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/actions/middleware";
import { signUp } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";
import Form from "next/form";

export function ActivateForm() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [state, formAction, pending] = useActionState<ActionState, FormData>(signUp, {
		error: "",
		success: "",
		email: "",
	});
	return (
		<Form action={formAction} className="text-left space-y-4">
			<div>
				<Label htmlFor="email">Email address</Label>
				<Input id="email" name="email" type="email" autoComplete="email" className="mt-1" defaultValue={state.email} />
			</div>

			<div>
				<Label htmlFor="password">Password</Label>
				<Input id="password" name="password" type="password" autoComplete="new-password" className="mt-1" />
				<p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
			</div>

			<div>
				<Label htmlFor="licenseKey">License Key</Label>
				<Input
					id="licenseKey"
					name="licenseKey"
					type="text"
					autoComplete="licenseKey"
					className="font-mono mt-1"
					defaultValue={token || ""}
				/>
			</div>

			{state.error && <div className="text-sm text-red-500 font-medium">{state.error}</div>}

			<SubmitButton pending={pending}>Create account</SubmitButton>
		</Form>
	);
}
