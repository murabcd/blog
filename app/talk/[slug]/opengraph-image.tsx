import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
	buildOgImage,
	defaultAlt,
	defaultContentType,
	defaultSize,
} from "@/app/_meta/og-image";

export const alt = defaultAlt;
export const size = defaultSize;
export const contentType = defaultContentType;

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await fetchQuery(api.talk.getEventBySlug, { slug });
	const title = event?.title ?? "Build. Ship. Iterate.";

	return buildOgImage(title);
}
