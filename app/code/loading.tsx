import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section>
			<Skeleton className="h-7 w-20" />
			<div className="mt-8 space-y-4">
				{Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
					<div key={key} className="flex flex-col md:flex-row gap-2">
						<Skeleton className="h-4 w-28" />
						<Skeleton className="h-4 w-10/12" />
					</div>
				))}
			</div>
		</section>
	);
}
