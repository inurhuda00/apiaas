"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@apiaas/db/schema";

// Define the UserContext types
type UserContextType = {
	userPromise: Promise<Pick<User, "id" | "name" | "email" | "role"> | null>;
	sessionPromise: Promise<string | null>; // Raw token value
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
	sessionPromise,
}: {
	children: ReactNode;
} & UserContextType) {
	return (
		<UserContext.Provider value={{ userPromise, sessionPromise }}>
			{children}
		</UserContext.Provider>
	);
}
