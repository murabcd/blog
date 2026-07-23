import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "../convex/_generated/api";
import { publicContentCacheTags } from "./public-content-cache-policy";

export async function getBlogPosts() {
	"use cache";
	cacheLife("hours");
	cacheTag(publicContentCacheTags.blogPosts);
	return fetchQuery(api.blog.getAllPosts);
}

export async function getBlogPost(slug: string) {
	"use cache";
	cacheLife("hours");
	cacheTag(publicContentCacheTags.blogPosts);
	return fetchQuery(api.blog.getPostBySlug, { slug });
}

export async function getTalkEvents() {
	"use cache";
	cacheLife("hours");
	cacheTag(publicContentCacheTags.talkEvents);
	return fetchQuery(api.talk.getAllEvents);
}

export async function getTalkEvent(slug: string) {
	"use cache";
	cacheLife("hours");
	cacheTag(publicContentCacheTags.talkEvents);
	return fetchQuery(api.talk.getEventBySlug, { slug });
}

export async function getCodeProjects() {
	"use cache";
	cacheLife("hours");
	cacheTag(publicContentCacheTags.codeProjects);
	return fetchQuery(api.code.getAllProjects);
}

export async function getStaticPage(slug: string) {
	"use cache";
	cacheLife("hours");
	cacheTag(publicContentCacheTags.staticPages);
	return fetchQuery(api.pages.getPageBySlug, { slug });
}

export async function getSearchContent() {
	const [posts, talks] = await Promise.all([getBlogPosts(), getTalkEvents()]);

	return {
		posts: posts.map(({ slug, title }) => ({ slug, title })),
		talks: talks.map(({ slug, title }) => ({ slug, title })),
	};
}

export type SearchContent = Awaited<ReturnType<typeof getSearchContent>>;
