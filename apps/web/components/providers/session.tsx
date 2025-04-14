"use client";

import { createContext, useContext, type ReactNode } from "react";

type SessionContextType = {
	sessionPromise: Promise<string | undefined>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession(): SessionContextType {
	const context = useContext(SessionContext);
	if (context === null) {
		throw new Error("useSession must be used within a SessionProvider");
	}
	return context;
}

export function SessionProvider({
	children,
	sessionPromise,
}: {
	children: ReactNode;
} & SessionContextType) {
	return (
		<SessionContext.Provider value={{ sessionPromise }}>
			{children}
		</SessionContext.Provider>
	);
}
