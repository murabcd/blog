import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";

export async function getSearchContent() {
	"use cache";
	cacheLife("hours");
	cacheTag("blogPosts", "talkEvents");

	const [posts, talks] = await Promise.all([
		fetchQuery(api.blog.getAllPosts),
		fetchQuery(api.talk.getAllEvents),
	]);

	return {
		posts: posts.map(({ slug, title }) => ({ slug, title })),
		talks: talks.map(({ slug, title }) => ({ slug, title })),
	};
}

export type SearchContent = Awaited<ReturnType<typeof getSearchContent>>;
