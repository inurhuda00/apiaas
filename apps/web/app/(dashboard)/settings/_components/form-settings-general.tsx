"use client";

import { startTransition, use, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@/components/providers/auth";
import { updateAccount } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

type ActionState = {
	error?: string;
	success?: string;
};

export function SettingsGeneralForm() {
	const { userPromise } = useUser();
	const user = use(userPromise);
	const [state, formAction, pending] = useActionState<ActionState, FormData>(
		updateAccount,
		{ error: "", success: "" },
	);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// If you call the Server Action directly, it will automatically
		// reset the form. We don't want that here, because we want to keep the
		// client-side values in the inputs. So instead, we use an event handler
		// which calls the action. You must wrap direct calls with startTransition.
		// When you use the `action` prop it automatically handles that for you.
		// Another option here is to persist the values to local storage. I might
		// explore alternative options.
		startTransition(() => {
			formAction(new FormData(event.currentTarget));
		});
	};
	return (
		<Card className="flex-1">
			<CardHeader>
				<CardTitle>Account Information</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							name="name"
							placeholder="Enter your name"
							defaultValue={user?.name || ""}
						/>
					</div>
					<div>
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="Enter your email"
							defaultValue={user?.email || ""}
							disabled
						/>
					</div>
					{state.error && <p className="text-red-500 text-sm">{state.error}</p>}
					{state.success && (
						<p className="text-green-500 text-sm">{state.success}</p>
					)}
					<SubmitButton pending={pending}>Save Changes</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
}
