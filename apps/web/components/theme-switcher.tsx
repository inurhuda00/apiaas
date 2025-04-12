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
				<span>Light</span>
				<div className="w-9 h-4.25 bg-muted" />
				<span>Dark</span>
			</div>
		);
	}

	return (
		<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
			<span>Light</span>
			<Switch
				checked={theme === "dark"}
				onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
				className="w-9 h-4.25"
			/>
			<span>Dark</span>
		</div>
	);
}
