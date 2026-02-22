"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeSwitcher() {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme = resolvedTheme || theme;
	const nextTheme = currentTheme === "dark" ? "light" : "dark";

	return (
		<>
			<button
				type="button"
				aria-label={`Switch to ${nextTheme} theme`}
				onClick={() => setTheme(nextTheme)}
				className="inline-flex items-center justify-center rounded-md border border-input bg-transparent p-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
			>
				{currentTheme === "dark" ? (
					<Sun className="h-4 w-4 transition-all" />
				) : (
					<Moon className="h-4 w-4 transition-all" />
				)}
				<span className="sr-only">Switch theme</span>
			</button>
			<ToggleGroup
				variant="outline"
				size="sm"
				type="single"
				value={theme}
				onValueChange={(value) => {
					if (value) {
						setTheme(value);
					}
				}}
				className="hidden md:flex"
			>
				<ToggleGroupItem value="light" aria-label="Switch to light theme">
					<Sun className="h-4 w-4 transition-all" />
					<span className="sr-only">Switch to light theme</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="dark" aria-label="Switch to dark theme">
					<Moon className="h-4 w-4 transition-all" />
					<span className="sr-only">Switch to dark theme</span>
				</ToggleGroupItem>
				<ToggleGroupItem value="system" aria-label="Switch to system theme">
					<Monitor className="h-4 w-4 transition-all" />
					<span className="sr-only">Switch to system theme</span>
				</ToggleGroupItem>
			</ToggleGroup>
		</>
	);
}
