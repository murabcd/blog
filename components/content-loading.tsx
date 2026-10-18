export function ContentLoading() {
	return (
		<section aria-label="Loading content" aria-busy="true">
			<output className="sr-only">Loading content…</output>
			<div className="motion-safe:animate-pulse" aria-hidden="true">
				<div className="h-8 w-3/4 rounded bg-muted" />
				<div className="mt-4 h-4 w-24 rounded bg-muted" />
				<div className="mt-8 space-y-3">
					<div className="h-4 rounded bg-muted" />
					<div className="h-4 rounded bg-muted" />
					<div className="h-4 w-4/5 rounded bg-muted" />
				</div>
			</div>
		</section>
	);
}
