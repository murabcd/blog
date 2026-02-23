"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<section className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
			<h1 className="title text-2xl font-semibold tracking-tighter">
				Something went wrong
			</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				Please try again. If the problem persists, refresh the page.
			</p>
			<div className="mt-6">
				<Button size="sm" onClick={() => reset()}>
					Try again
				</Button>
			</div>
			{error?.digest ? (
				<p className="mt-4 text-xs text-muted-foreground">
					Error ID: {error.digest}
				</p>
			) : null}
		</section>
	);
}
