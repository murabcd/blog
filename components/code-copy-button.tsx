"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type CodeCopyButtonProps = {
	code: string;
};

export function CodeCopyButton({ code }: CodeCopyButtonProps) {
	const { copyToClipboard, isCopied } = useCopyToClipboard({
		onCopy: () => {
			toast.success("Copied to clipboard");
		},
		onError: () => {
			toast.error("Failed to copy code");
		},
	});

	const label = isCopied ? "Copied!" : "Copy code";

	return (
		<Button
			type="button"
			variant="outline"
			size="icon"
			onClick={() => copyToClipboard(code)}
			className="absolute top-2 right-2 z-10 size-7 bg-background/80 text-muted-foreground opacity-0 shadow-xs transition-all group-hover:opacity-100 hover:text-accent-foreground active:scale-95 focus-visible:opacity-100"
			aria-label={label}
			title={label}
		>
			{isCopied ? <Check /> : <Copy />}
		</Button>
	);
}
