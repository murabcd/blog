import { readBlogPosts, readTalkEvents } from "@/lib/content-catalog";
import { baseUrl } from "@/lib/site";

export default async function sitemap() {
	const blogs = readBlogPosts(process.cwd()).map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.publishedAt,
	}));

	const talks = readTalkEvents(process.cwd()).map((event) => ({
		url: `${baseUrl}/talk/${event.slug}`,
		lastModified: event.publishedAt,
	}));

	const routes = ["", "/blog", "/chat", "/code", "/talk"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...blogs, ...talks];
}
