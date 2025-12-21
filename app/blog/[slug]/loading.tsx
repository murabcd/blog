import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section>
			<Skeleton className="h-7 w-9/12" />
			<Skeleton className="mt-3 h-4 w-40" />
			<div className="mt-6 mb-4 flex items-center gap-2">
				<Skeleton className="h-9 w-9 rounded-md" />
				<Skeleton className="h-9 w-9 rounded-md" />
				<div className="ml-auto">
					<Skeleton className="h-9 w-28 rounded-md" />
				</div>
			</div>
			<div className="mt-8 space-y-3">
				{Array.from({ length: 10 }, (_, i) => `skeleton-${i}`).map((key) => (
					<Skeleton key={key} className="h-4 w-full" />
				))}
			</div>
		</section>
	);
}
