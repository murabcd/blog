import { cacheLife } from "next/cache";

export async function CurrentYear() {
	"use cache";
	cacheLife("days");

	return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
