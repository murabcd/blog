import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<section>
			<Skeleton className="h-7 w-40" />
			<div className="mt-6 space-y-3">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-11/12" />
				<Skeleton className="h-4 w-9/12" />
			</div>
		</section>
	);
}
