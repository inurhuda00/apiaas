"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "..";
import { membership, type NewUser, users } from "@apiaas/db/schema";
import { activateLicenseKey } from "@/lib/payments/polar";
import { hashPassword } from "@apiaas/auth";

export async function getCustomerId(userId: number) {
	const query = db
		.select({
			customerId: users.customerId,
		})
		.from(users)
		.where(and(eq(users.id, sql.placeholder("userId")), isNull(users.deletedAt)))
		.limit(1)
		.prepare("get_customer_id");

	const [user] = await query.execute({
		userId,
	});

	return user?.customerId;
}

export async function createUser({
	email,
	password,
	licenseKey,
}: {
	email: string;
	password: string;
	licenseKey: string;
}) {
	return await db.transaction(async (tx) => {
		const hashedPassword = await hashPassword(password);

		const insertUserQuery = tx
			.insert(users)
			.values({
				email: sql.placeholder("email"),
				password: sql.placeholder("password"),
			})
			.returning({ id: users.id, role: users.role })
			.prepare("insert_user");

		const [userData] = await insertUserQuery.execute({
			email,
			password: hashedPassword,
		});

		if (!userData) {
			throw new Error("Failed to create user");
		}

		// const activatedKey = await activateLicenseKey(licenseKey);
		// if (!activatedKey) {
		// 	throw new Error("Failed to activate license key");
		// }

		const insertMembershipQuery = tx
			.insert(membership)
			.values({
				userId: sql.placeholder("userId"),
				licenseKey: sql.placeholder("licenseKey"),
				tier: sql.placeholder("tier"),
			})
			.returning()
			.prepare("insert_membership");

		const [membershipData] = await insertMembershipQuery.execute({
			userId: userData.id,
			licenseKey,
			tier: "pro",
		});

		if (!membershipData) {
			throw new Error("Failed to add membership");
		}

		return userData;
	});
}

export async function getUserById(id: number) {
	const query = db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
		})
		.from(users)
		.where(and(eq(users.id, sql.placeholder("userId")), isNull(users.deletedAt)))
		.limit(1)
		.prepare("get_user_by_id");

	const [user] = await query.execute({
		userId: id,
	});

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}

export async function getUserByEmail(email: string) {
	const query = db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.role,
			password: users.password,
		})
		.from(users)
		.where(and(eq(users.email, sql.placeholder("email")), isNull(users.deletedAt)))
		.limit(1)
		.prepare("get_user_by_email");

	const [user] = await query.execute({
		email,
	});

	return user;
}

export async function updateUserPassword(userId: number, newPassword: string) {
	const hashedPassword = await hashPassword(newPassword);

	const query = db
		.update(users)
		.set({ password: hashedPassword })
		.where(eq(users.id, sql.placeholder("userId")))
		.prepare("update_user_password");

	return query.execute({
		userId,
	});
}

export async function softDeleteUser(userId: number) {
	const query = db
		.update(users)
		.set({
			deletedAt: sql`CURRENT_TIMESTAMP`,
			email: sql`CONCAT(email, '-', ${sql.placeholder("userId")}, '-deleted')`,
		})
		.where(eq(users.id, sql.placeholder("userId")))
		.prepare("soft_delete_user");

	return query.execute({
		userId,
	});
}

export async function updateUserAccount(userId: number, data: Pick<NewUser, "name">) {
	const query = db
		.update(users)
		.set({ name: data.name })
		.where(eq(users.id, sql.placeholder("userId")))
		.prepare("update_user_account");

	return query.execute({
		userId,
	});
}
