import type { Infer } from "convex/values";
import { v } from "convex/values";

export const blogPostValidator = v.object({
	slug: v.string(),
	title: v.string(),
	summary: v.string(),
	content: v.string(),
	publishedAt: v.string(),
	image: v.optional(v.string()),
});

export type BlogPost = Infer<typeof blogPostValidator>;

export const talkEventValidator = v.object({
	slug: v.string(),
	title: v.string(),
	summary: v.string(),
	content: v.string(),
	publishedAt: v.string(),
	image: v.optional(v.string()),
});

export type TalkEvent = Infer<typeof talkEventValidator>;

export const codeProjectValidator = v.object({
	slug: v.string(),
	title: v.string(),
	href: v.string(),
	date: v.string(),
	content: v.string(),
	published: v.boolean(),
});

export type CodeProject = Infer<typeof codeProjectValidator>;

export const staticPageValidator = v.object({
	slug: v.string(),
	title: v.string(),
	content: v.string(),
	published: v.boolean(),
});

export type StaticPage = Infer<typeof staticPageValidator>;

export type ContentCatalog = {
	blogPosts: BlogPost[];
	talkEvents: TalkEvent[];
	codeProjects: CodeProject[];
	staticPages: StaticPage[];
};
