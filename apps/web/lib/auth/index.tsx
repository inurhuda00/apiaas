"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@apiaas/db/schema";

type UserContextType = {
	userPromise: Promise<Pick<User, "id" | "name" | "email" | "role"> | null>;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType {
	const context = useContext(UserContext);
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
		<UserContext.Provider value={{ userPromise }}>
			{children}
		</UserContext.Provider>
	);
}
