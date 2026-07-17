"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type CodeCopyButtonProps = {
	code: string;
};

const COPIED_RESET_DELAY_MS = 2_000;

export function CodeCopyButton({ code }: CodeCopyButtonProps) {
	const [copied, setCopied] = useState(false);

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			toast.success("Copied to clipboard");
			window.setTimeout(() => setCopied(false), COPIED_RESET_DELAY_MS);
		} catch (error) {
			console.error("Failed to copy code", error);
			toast.error("Failed to copy code");
		}
	}

	const label = copied ? "Copied!" : "Copy code";

	return (
		<button
			type="button"
			onClick={copyCode}
			className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 p-0 bg-background/80 border border-border rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 shadow-xs active:scale-95 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
			aria-label={label}
			title={label}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</button>
	);
}
