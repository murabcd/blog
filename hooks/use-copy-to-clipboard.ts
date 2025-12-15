"use client";

import * as React from "react";

export function useCopyToClipboard({
	timeout = 2000,
	onCopy,
	onError,
}: {
	timeout?: number;
	onCopy?: () => void;
	onError?: (error: Error) => void;
} = {}) {
	const [isCopied, setIsCopied] = React.useState(false);

	const copyToClipboard = (value: string) => {
		if (typeof window === "undefined" || !navigator.clipboard.writeText) {
			return;
		}

		if (!value) return;

		navigator.clipboard.writeText(value).then(
			() => {
				setIsCopied(true);

				if (onCopy) {
					onCopy();
				}

				if (timeout !== 0) {
					setTimeout(() => {
						setIsCopied(false);
					}, timeout);
				}
			},
			(error) => {
				console.error("Failed to copy to clipboard:", error);
				if (onError) {
					onError(error instanceof Error ? error : new Error(String(error)));
				}
			},
		);
	};

	return { isCopied, copyToClipboard };
}
