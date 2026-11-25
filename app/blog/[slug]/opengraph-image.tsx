import {
	buildOgImage,
	defaultAlt,
	defaultContentType,
	defaultSize,
} from "@/app/_meta/og-image";
import { getBlogPosts } from "@/lib/public-content-cache";

export const alt = defaultAlt;
export const size = defaultSize;
export const contentType = defaultContentType;

export async function generateStaticParams() {
	const posts = await getBlogPosts();
	return posts.map(({ slug }) => ({ slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const [{ slug }, items] = await Promise.all([params, getBlogPosts()]);
	const post = items.find((item) => item.slug === slug);
	const title = post?.title ?? "Build. Ship. Iterate.";

	return buildOgImage(title);
}
