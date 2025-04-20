import Link from "next/link";
import { formatDate, getSpeakingEvents } from "@/lib/utils";

export function SpeakingEvents() {
  const allEvents = getSpeakingEvents();

  return (
    <div>
      {allEvents
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1;
          }
          return 1;
        })
        .map((event) => (
          <Link
            key={event.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/speaking/${event.slug}`}
          >
            <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
              <p className="text-neutral-600 dark:text-neutral-400 w-[110px] tabular-nums">
                {formatDate(event.metadata.publishedAt, false)}
              </p>
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {event.metadata.title}
              </p>
            </div>
          </Link>
        ))}
    </div>
  );
}
