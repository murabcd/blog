"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	return (
		<ToggleGroup
			variant="outline"
			size="sm"
			type="single"
			value={theme}
			onValueChange={(value) => setTheme(value)}
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
	);
}
