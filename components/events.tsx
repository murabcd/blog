import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getTalksEvents } from "@/lib/server-utils";

export function TalksEvents() {
	const allEvents = getTalksEvents();

	return (
		<div className="relative">
			<div className="space-y-4">
				{allEvents
					.sort((a, b) => {
						if (
							new Date(a.metadata.publishedAt) >
							new Date(b.metadata.publishedAt)
						) {
							return -1;
						}
						return 1;
					})
					.map((event) => (
						<Link
							key={event.slug}
							className="block group"
							href={`/talk/${event.slug}`}
						>
							<div className="flex flex-col md:flex-row gap-2">
								<p className="text-muted-foreground w-[110px] tabular-nums">
									{formatDate(event.metadata.publishedAt, false)}
								</p>
								<p className="text-foreground tracking-tight group-hover:underline">
									{event.metadata.title}
								</p>
							</div>
						</Link>
					))}
			</div>
		</div>
	);
}
