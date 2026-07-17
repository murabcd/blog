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
	const resetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
		null,
	);

	React.useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	const copyToClipboard = (value: string) => {
		if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
			onError?.(new Error("Clipboard access is unavailable"));
			return;
		}

		if (!value) return;

		navigator.clipboard.writeText(value).then(
			() => {
				setIsCopied(true);

				onCopy?.();

				if (timeout !== 0) {
					if (resetTimeoutRef.current !== null) {
						clearTimeout(resetTimeoutRef.current);
					}
					resetTimeoutRef.current = setTimeout(() => {
						setIsCopied(false);
						resetTimeoutRef.current = null;
					}, timeout);
				}
			},
			(error) => {
				console.error("Failed to copy to clipboard:", error);
				onError?.(error instanceof Error ? error : new Error(String(error)));
			},
		);
	};

	return { isCopied, copyToClipboard };
}
