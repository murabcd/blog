import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	postLikes: defineTable({
		postSlug: v.string(),
		visitorId: v.string(),
		likedAt: v.number(),
	})
		.index("by_post", ["postSlug"])
		.index("by_visitor_post", ["visitorId", "postSlug"]),

	// Blog posts table
	blogPosts: defineTable({
		slug: v.string(),
		title: v.string(),
		summary: v.string(),
		// Deprecated: migrated to blogPostContents.content.
		content: v.optional(v.string()),
		publishedAt: v.string(),
		image: v.optional(v.string()),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_publishedAt", ["publishedAt"])
		.searchIndex("search_title", {
			searchField: "title",
		}),
	blogPostContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.searchIndex("search_content", {
			searchField: "content",
		}),

	// Talk events table
	talkEvents: defineTable({
		slug: v.string(),
		title: v.string(),
		summary: v.string(),
		// Deprecated: migrated to talkEventContents.content.
		content: v.optional(v.string()),
		publishedAt: v.string(),
		image: v.optional(v.string()),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_publishedAt", ["publishedAt"])
		.searchIndex("search_title", {
			searchField: "title",
		}),
	talkEventContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.searchIndex("search_content", {
			searchField: "content",
		}),

	// Code projects table
	codeProjects: defineTable({
		slug: v.string(),
		title: v.string(),
		href: v.string(),
		date: v.string(),
		// Deprecated: migrated to codeProjectContents.content.
		content: v.optional(v.string()),
		published: v.boolean(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_date", ["date"])
		.index("by_published", ["published"])
		.index("by_published_date", ["published", "date"]),
	codeProjectContents: defineTable({
		slug: v.string(),
		content: v.string(),
		lastSyncedAt: v.number(),
	}).index("by_slug", ["slug"]),

	// Static pages table (for chat page and other static content)
	staticPages: defineTable({
		slug: v.string(),
		title: v.string(),
		// Deprecated: migrated to staticPageContents.content.
		content: v.optional(v.string()),
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
