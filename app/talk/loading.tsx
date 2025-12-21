import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section>
			<Skeleton className="h-7 w-20" />
			<div className="mt-8 space-y-4">
				{Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
					<div key={key} className="flex flex-col gap-2 md:flex-row">
						<Skeleton className="h-4 w-[110px]" />
						<Skeleton className="h-4 w-10/12" />
					</div>
				))}
			</div>
		</section>
	);
}
