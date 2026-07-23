import {
	buildOgImage,
	defaultAlt,
	defaultContentType,
	defaultSize,
} from "@/app/_meta/og-image";
import { getTalkEvent } from "@/lib/public-content-cache";

export const alt = defaultAlt;
export const size = defaultSize;
export const contentType = defaultContentType;

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await getTalkEvent(slug);
	const title = event?.title ?? "Build. Ship. Iterate.";

	return buildOgImage(title);
}
