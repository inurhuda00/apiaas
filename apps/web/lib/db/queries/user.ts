"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "..";
import { membership, users } from "@apiaas/db/schema";
import { activateLicenseKey } from "@/lib/payments/polar";
import { hashPassword, verifyToken } from "@apiaas/auth";
import { env } from "@/env";

export async function getUser() {
	const sessionCookie = (await cookies()).get("session");
	if (!sessionCookie || !sessionCookie.value) {
		return null;
	}

	const sessionData = await verifyToken(sessionCookie.value, env.AUTH_SECRET);
	if (
		!sessionData ||
		!sessionData.user ||
		typeof sessionData.user.id !== "number"
	) {
		return null;
	}

	if (new Date(sessionData.expires) < new Date()) {
		return null;
	}

	const user = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
		})
		.from(users)
		.where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
		.limit(1);

	if (user.length === 0) {
		return null;
	}

	return user[0];
}

export async function getCustomerId(userId: number) {
	const query = db
		.select({
			customerId: users.customerId,
		})
		.from(users)
		.where(
			and(eq(users.id, sql.placeholder("userId")), isNull(users.deletedAt)),
		)
		.limit(1)
		.prepare("get_customer_id");

	const [user] = await query.execute({
		userId,
	});

	return user.customerId;
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

		const [userData] = await tx
			.insert(users)
			.values({
				email,
				password: hashedPassword,
			})
			.returning({ id: users.id, role: users.role });

		if (!userData) {
			throw new Error("Failed to create user");
		}

		const activatedKey = await activateLicenseKey();
		if (!activatedKey) {
			throw new Error("Failed to activate license key");
		}

		const [membershipData] = await tx
			.insert(membership)
			.values({
				userId: userData.id,
				licenseKey,
				tier: "pro",
			})
			.returning();

		if (!membershipData) {
			throw new Error("Failed to add membership");
		}

		return userData;
	});
}
