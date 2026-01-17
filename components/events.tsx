import Link from "next/link";
import { useMemo } from "react";
import { formatDate } from "@/lib/utils";

type TalkEvent = {
	slug: string;
	title: string;
	publishedAt: string;
};

export function TalksEvents({ events }: { events: TalkEvent[] }) {
	const sortedEvents = useMemo(
		() =>
			[...events].sort(
				(a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
			),
		[events],
	);

	return (
		<div className="relative">
			<div className="space-y-4">
				{sortedEvents.map((event) => (
					<Link
						key={event.slug}
						className="block group"
						href={`/talk/${event.slug}`}
					>
						<div className="flex flex-col md:flex-row gap-2">
							<p className="text-muted-foreground w-[110px] tabular-nums">
								{formatDate(event.publishedAt, false)}
							</p>
							<p className="text-foreground tracking-tight group-hover:underline">
								{event.title}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
