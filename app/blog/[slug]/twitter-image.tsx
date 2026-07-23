import {
	buildOgImage,
	defaultAlt,
	defaultContentType,
	defaultSize,
} from "@/app/_meta/og-image";
import { getBlogPost } from "@/lib/public-content-cache";

export const alt = defaultAlt;
export const size = defaultSize;
export const contentType = defaultContentType;

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getBlogPost(slug);
	const title = post?.title ?? "Build. Ship. Iterate.";

	return buildOgImage(title);
}
