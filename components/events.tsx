import Link from "next/link";
import { formatDate } from "@/lib/utils";

type TalkEvent = {
	slug: string;
	title: string;
	publishedAt: string;
};

export function TalksEvents({ events }: { events: TalkEvent[] }) {
	return (
		<div className="relative">
			<div className="space-y-4">
				{events
					.sort((a, b) => {
						if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
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
