"use client";

import { createContext, use, type ReactNode } from "react";
import type { User } from "@apiaas/db/schema";

type UserContextType = {
	userPromise: Promise<Pick<User, "id" | "name" | "email" | "role"> | null>;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType {
	const context = use(UserContext);
	if (context === null) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}

export function UserProvider({
	children,
	userPromise,
}: {
	children: ReactNode;
} & UserContextType) {
	return (
		<UserContext value={{ userPromise }}>
			{children}
		</UserContext>
	);
}
