import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section>
			<Skeleton className="h-7 w-8/12" />
			<Skeleton className="mt-3 h-4 w-32" />
			<div className="mt-8 space-y-3">
				{Array.from({ length: 10 }, (_, i) => `skeleton-${i}`).map((key) => (
					<Skeleton key={key} className="h-4 w-full" />
				))}
			</div>
		</section>
	);
}
