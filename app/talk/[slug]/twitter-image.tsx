import {
	buildOgImage,
	defaultAlt,
	defaultContentType,
	defaultSize,
} from "@/app/_meta/og-image";
import { getTalkEvents } from "@/lib/public-content-cache";

export const alt = defaultAlt;
export const size = defaultSize;
export const contentType = defaultContentType;

export async function generateStaticParams() {
	const events = await getTalkEvents();
	return events.map(({ slug }) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const [{ slug }, items] = await Promise.all([params, getTalkEvents()]);
	const event = items.find((item) => item.slug === slug);
	const title = event?.title ?? "Build. Ship. Iterate.";

	return buildOgImage(title);
}
