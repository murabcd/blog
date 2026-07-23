import type { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type {
	ContentPublicationAdapters,
	PublicationBatch,
} from "./content-publication";

type ContentPublisher = ContentPublicationAdapters["publish"];

export function createConvexContentPublisher(
	client: ConvexHttpClient,
	syncSecret: string,
): ContentPublisher {
	return async (batch: PublicationBatch) => {
		switch (batch.kind) {
			case "blogPosts":
				return client.mutation(api.blog.syncPostsPublic, {
					syncSecret,
					slugs: batch.items.map((post) => post.slug),
					posts: batch.items,
				});
			case "talkEvents":
				return client.mutation(api.talk.syncEventsPublic, {
					syncSecret,
					slugs: batch.items.map((event) => event.slug),
					events: batch.items,
				});
			case "codeProjects":
				return client.mutation(api.code.syncProjectsPublic, {
					syncSecret,
					slugs: batch.items.map((project) => project.slug),
					projects: batch.items,
				});
			case "staticPages":
				return client.mutation(api.pages.syncPagesPublic, {
					syncSecret,
					slugs: batch.items.map((page) => page.slug),
					pages: batch.items,
				});
		}
	};
}
