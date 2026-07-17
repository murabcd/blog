"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function subscribe() {
	return () => {};
}

function getClientSnapshot() {
	return true;
}

function getServerSnapshot() {
	return false;
}

export function ThemeSwitcher() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const mounted = React.useSyncExternalStore(
		subscribe,
		getClientSnapshot,
		getServerSnapshot,
	);

	if (!mounted) {
		return null;
	}

	const currentTheme = resolvedTheme || theme;
	const nextTheme = currentTheme === "dark" ? "light" : "dark";

	return (
		<button
			type="button"
			aria-label={`Switch to ${nextTheme} theme`}
			onClick={() => setTheme(nextTheme)}
			className="inline-flex items-center justify-center rounded-md border border-input bg-transparent p-1.5 text-sm text-muted-foreground transition-all hover:text-primary"
		>
			{currentTheme === "dark" ? (
				<Sun className="size-4 transition-all" />
			) : (
				<Moon className="size-4 transition-all" />
			)}
			<span className="sr-only">Switch theme</span>
		</button>
	);
}
