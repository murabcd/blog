"use client";

export function CurrentYear() {
	const year = new Date().getFullYear();
	return <span suppressHydrationWarning>{year}</span>;
}
