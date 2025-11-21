import { getBlogPosts, getTalksEvents } from "@/lib/server-utils";

export const baseUrl = "https://murabcd.vercel.app";

export default async function sitemap() {
	const blogs = getBlogPosts().map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.metadata.publishedAt,
	}));

	const talks = getTalksEvents().map((event) => ({
		url: `${baseUrl}/talk/${event.slug}`,
		lastModified: event.metadata.publishedAt,
	}));

	const routes = ["", "/blog", "/chat", "/code", "/talk"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...blogs, ...talks];
}
