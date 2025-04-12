"use server";

import { redirect } from "next/navigation";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import {
	signInSchema,
	updatePasswordSchema,
	deleteAccountSchema,
	updateAccountSchema,
	signUpSchema,
	forgotPasswordSchema,
} from "./auth.validation";
import { validatedAction, validatedActionWithUser } from "./middleware";
import { cookies } from "next/headers";
import {
	getUserByEmail,
	updateUserPassword,
	softDeleteUser,
	updateUserAccount,
} from "@/lib/db/queries/auth";
import type { User } from "@apiaas/db/schema";
import { createUser } from "@/lib/db/queries/user";
import { activateLicenseKey } from "@/lib/payments/polar";
import { db } from "@/lib/db";

export const signIn = validatedAction(signInSchema, async (data, _) => {
	const { email, password } = data;

	const loggedUser = await getUserByEmail(email);

	if (!loggedUser) {
		return {
			error: "Invalid email or password. Please try again.",
			email,
			password,
		};
	}

	const isPasswordValid = await comparePasswords(password, loggedUser.password);

	if (!isPasswordValid) {
		return {
			error: "Invalid email or password. Please try again.",
			email,
			password,
		};
	}

	await setSession(loggedUser);

	redirect("/overview");
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
	const { email, password, licenseKey } = data;

	const existingUser = await getUserByEmail(email);

	if (existingUser) {
		return {
			error: "Email already in use. Please use a different email or sign in.",
			email,
		};
	}

	try {
		const newUser = await createUser({
			email,
			password,
			licenseKey,
		});

		await setSession(newUser);

		redirect("/overview");
	} catch (error) {
		return {
			error:
				error instanceof Error
					? error.message
					: "Something went wrong. Please try again.",
			email,
		};
	}
});

export const forgotPassword = validatedAction(
	forgotPasswordSchema,
	async (data, formData) => {
		const { email } = data;

		const loggedUser = await getUserByEmail(email);

		if (!loggedUser) {
			return {
				error: "Invalid email or password. Please try again.",
				email,
			};
		}

		return {
			success: "A password reset link has been sent to your email address.",
			email,
		};
	},
);

export async function signOut() {
	(await cookies()).delete("session");
	redirect("/");
}

export const updatePassword = validatedActionWithUser(
	updatePasswordSchema,
	async (data, _, { email }) => {
		const { currentPassword, newPassword } = data;

		const user = (await getUserByEmail(email)) as User;

		const isPasswordValid = await comparePasswords(
			currentPassword,
			user.password,
		);

		if (!isPasswordValid) {
			return { error: "Current password is incorrect." };
		}

		if (currentPassword === newPassword) {
			return {
				error: "New password must be different from the current password.",
			};
		}

		const newpassword = await hashPassword(newPassword);
		await updateUserPassword(user.id, newpassword);

		return { success: "Password updated successfully." };
	},
);

export const deleteAccount = validatedActionWithUser(
	deleteAccountSchema,
	async (data, _, { email }) => {
		const { password } = data;

		const user = (await getUserByEmail(email)) as User;

		const isPasswordValid = await comparePasswords(password, user.password);
		if (!isPasswordValid) {
			return { error: "Incorrect password. Account deletion failed." };
		}

		await softDeleteUser(user.id);
		(await cookies()).delete("session");
		redirect("/sign-in");
	},
);

export const updateAccount = validatedActionWithUser(
	updateAccountSchema,
	async (data, _, user) => {
		const { name } = data;
		await updateUserAccount(user.id, { name });
		return { success: "Account updated successfully." };
	},
);
