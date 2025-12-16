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
		content: v.string(), // MDX content
		publishedAt: v.string(),
		image: v.optional(v.string()),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_publishedAt", ["publishedAt"])
		.searchIndex("search_content", {
			searchField: "content",
		})
		.searchIndex("search_title", {
			searchField: "title",
		}),

	// Talk events table
	talkEvents: defineTable({
		slug: v.string(),
		title: v.string(),
		summary: v.string(),
		content: v.string(), // MDX content
		publishedAt: v.string(),
		image: v.optional(v.string()),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_publishedAt", ["publishedAt"])
		.searchIndex("search_content", {
			searchField: "content",
		})
		.searchIndex("search_title", {
			searchField: "title",
		}),

	// Code projects table
	codeProjects: defineTable({
		slug: v.string(),
		title: v.string(),
		href: v.string(),
		date: v.string(),
		content: v.string(), // MDX content
		published: v.boolean(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_date", ["date"])
		.index("by_published", ["published"]),

	// Static pages table (for chat page and other static content)
	staticPages: defineTable({
		slug: v.string(),
		title: v.string(),
		content: v.string(), // MDX content
		published: v.boolean(),
		lastSyncedAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_published", ["published"]),
});
