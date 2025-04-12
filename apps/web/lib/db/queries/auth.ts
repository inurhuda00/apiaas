"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { users } from "@apiaas/db/schema";
import type { NewUser } from "@apiaas/db/schema";

export async function getUserByEmail(email: string) {
	return db.query.users.findFirst({
		columns: {
			id: true,
			name: true,
			email: true,
			role: true,
			password: true,
		},
		where: eq(users.email, email),
	});
}

export async function updateUserPassword(userId: number, newPassword: string) {
	return db
		.update(users)
		.set({ password: newPassword })
		.where(eq(users.id, userId));
}

export async function softDeleteUser(userId: number) {
	return db
		.update(users)
		.set({
			deletedAt: sql`CURRENT_TIMESTAMP`,
			email: sql`CONCAT(email, '-', id, '-deleted')`, // Ensure email uniqueness
		})
		.where(eq(users.id, userId));
}

export async function updateUserAccount(
	userId: number,
	data: Pick<NewUser, "name">,
) {
	return db.update(users).set(data).where(eq(users.id, userId));
}
