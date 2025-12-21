import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section>
			<Skeleton className="h-7 w-24" />
			<div className="mt-8 space-y-3">
				{Array.from({ length: 8 }, (_, i) => `skeleton-${i}`).map((key) => (
					<Skeleton key={key} className="h-4 w-full" />
				))}
			</div>
		</section>
	);
}
