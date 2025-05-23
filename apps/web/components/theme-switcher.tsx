"use client";

import { Switch } from "./ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
				<span>☀️</span>
				<div className="w-9 h-5 bg-muted rounded-full" />
				<span>🌙</span>
			</div>
		);
	}

	return (
		<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
			<span className={theme === "light" ? "text-primary" : ""}>☀️</span>
			<Switch
				checked={theme === "dark"}
				onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
				className="w-9 h-5"
			/>
			<span className={theme === "dark" ? "text-primary" : ""}>🌙</span>
		</div>
	);
}
