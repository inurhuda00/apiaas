"use server";

import { redirect } from "next/navigation";
import { comparePasswords, deleteSession, hashPassword, setSession } from "@/lib/auth/session";
import {
	signInSchema,
	updatePasswordSchema,
	deleteAccountSchema,
	updateAccountSchema,
	signUpSchema,
	forgotPasswordSchema,
	signOutSchema,
} from "./auth.validation";
import { validatedAction, validatedActionWithUser } from "./middleware";
import {
	createUser,
	getUserByEmail,
	updateUserPassword,
	softDeleteUser,
	updateUserAccount,
} from "@/lib/db/queries/user";

export const signIn = validatedAction(signInSchema, async (data, _formData) => {
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

export const signUp = validatedAction(signUpSchema, async (data, _formData) => {
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
			error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
			email,
		};
	}
});

export const forgotPassword = validatedAction(forgotPasswordSchema, async (data, _formData) => {
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
});

export const signOut = validatedActionWithUser(signOutSchema, async (_data, _formData, _user) => {
	await deleteSession();
	redirect("/");
});

export const updatePassword = validatedActionWithUser(updatePasswordSchema, async (data, _formData, { email }) => {
	const { currentPassword, newPassword } = data;

	const user = await getUserByEmail(email);

	if (!user) {
		return { error: "User not found." };
	}

	const isPasswordValid = await comparePasswords(currentPassword, user.password);

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
});

export const deleteAccount = validatedActionWithUser(deleteAccountSchema, async (data, _formData, { email }) => {
	const { password } = data;

	const user = await getUserByEmail(email);

	if (!user) {
		return { error: "User not found." };
	}

	const isPasswordValid = await comparePasswords(password, user.password);
	if (!isPasswordValid) {
		return { error: "Incorrect password. Account deletion failed." };
	}

	await softDeleteUser(user.id);
	await deleteSession();
	redirect("/sign-in");
});

export const updateAccount = validatedActionWithUser(updateAccountSchema, async (data, _formData, user) => {
	const { name } = data;
	await updateUserAccount(user.id, { name });
	return { success: "Account updated successfully." };
});
