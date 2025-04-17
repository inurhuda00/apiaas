"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { startTransition, useActionState } from "react";
import { deleteAccount, updatePassword } from "@/actions/auth";
import { Icons } from "@/components/ui/icons";
import { SubmitButton } from "@/components/ui/submit-button";

type ActionState = {
	error?: string;
	success?: string;
};

export function SettingPasswordForm() {
	const [state, action, pending] = useActionState<ActionState, FormData>(updatePassword, { error: "", success: "" });

	const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		// If you call the Server Action directly, it will automatically
		// reset the form. We don't want that here, because we want to keep the
		// client-side values in the inputs. So instead, we use an event handler
		// which calls the action. You must wrap direct calls with startTransition.
		// When you use the `action` prop it automatically handles that for you.
		// Another option here is to persist the values to local storage. I might
		// explore alternative options.
		startTransition(() => {
			action(new FormData(event.currentTarget));
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={handlePasswordSubmit}>
					<div>
						<Label htmlFor="current-password">Current Password</Label>
						<Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" />
					</div>
					<div>
						<Label htmlFor="new-password">New Password</Label>
						<Input id="new-password" name="newPassword" type="password" autoComplete="new-password" />
					</div>
					<div>
						<Label htmlFor="confirm-password">Confirm New Password</Label>
						<Input id="confirm-password" name="confirmPassword" type="password" />
					</div>
					{state.error && <p className="text-red-500 text-xs">{state.error}</p>}
					{state.success && <p className="text-green-500 text-sm">{state.success}</p>}
					<SubmitButton pending={pending}>Update Password</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
}

export function SettingsDeleteForm() {
	const [state, formAction, pending] = useActionState<ActionState, FormData>(deleteAccount, { error: "", success: "" });

	const handleDeleteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		startTransition(() => {
			formAction(new FormData(event.currentTarget));
		});
	};
	return (
		<Card>
			<CardHeader>
				<CardTitle>Delete Account</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-gray-500 mb-4">Account deletion is non-reversable. Please proceed with caution.</p>
				<form onSubmit={handleDeleteSubmit} className="space-y-4">
					<div>
						<Label htmlFor="delete-password">Confirm Password</Label>
						<Input id="delete-password" name="password" type="password" minLength={8} maxLength={100} />
					</div>
					{state.error && <p className="text-red-500 text-xs">{state.error}</p>}
					<SubmitButton pending={pending}>Delete Account</SubmitButton>
				</form>
			</CardContent>
		</Card>
	);
}
