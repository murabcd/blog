import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	postLikes: defineTable({
		postSlug: v.string(),
		visitorId: v.string(),
		likedAt: v.number(),
	})
		.index("by_postSlug", ["postSlug"])
		.index("by_visitorId_and_postSlug", ["visitorId", "postSlug"]),

	// Blog posts table
	blogPosts: defineTable({
		slug: v.string(),
		title: v.string(),
		summary: v.string(),
		publishedAt: v.string(),
		image: v.optional(v.string()),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_publishedAt", ["publishedAt"]),
	blogPostContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	}).index("by_slug", ["slug"]),

	// Talk events table
	talkEvents: defineTable({
		slug: v.string(),
		title: v.string(),
		summary: v.string(),
		publishedAt: v.string(),
		image: v.optional(v.string()),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_publishedAt", ["publishedAt"]),
	talkEventContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	}).index("by_slug", ["slug"]),

	// Code projects table
	codeProjects: defineTable({
		slug: v.string(),
		title: v.string(),
		href: v.string(),
		date: v.string(),
		published: v.boolean(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_published_and_date", ["published", "date"]),
	codeProjectContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	}).index("by_slug", ["slug"]),

	// Static pages table (for chat page and other static content)
	staticPages: defineTable({
		slug: v.string(),
		title: v.string(),
		published: v.boolean(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_published", ["published"]),
	staticPageContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	}).index("by_slug", ["slug"]),
});
