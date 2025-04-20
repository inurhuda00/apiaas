"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return (
		<NextThemesProvider
			{...props}
			attribute="class"
			enableSystem
			defaultTheme="light"
			value={{
				light: "light",
				dark: "dark",
			}}
		>
			{children}
		</NextThemesProvider>
	);
}
