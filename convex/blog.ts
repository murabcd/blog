import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all published blog posts, sorted by publishedAt descending
export const getAllPosts = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("blogPosts"),
			_creationTime: v.number(),
			slug: v.string(),
			title: v.string(),
			summary: v.string(),
			publishedAt: v.string(),
			image: v.optional(v.string()),
		}),
	),
	handler: async (ctx) => {
		const posts = await ctx.db
			.query("blogPosts")
			.withIndex("by_publishedAt")
			.collect();

		// Sort by publishedAt descending
		const sortedPosts = posts.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		);

		// Return without content for list view
		return sortedPosts.map((post) => ({
			_id: post._id,
			_creationTime: post._creationTime,
			slug: post.slug,
			title: post.title,
			summary: post.summary,
			publishedAt: post.publishedAt,
			image: post.image,
		}));
	},
});

// Get a single blog post by slug
export const getPostBySlug = query({
	args: {
		slug: v.string(),
	},
	returns: v.union(
		v.object({
			_id: v.id("blogPosts"),
			_creationTime: v.number(),
			slug: v.string(),
			title: v.string(),
			summary: v.string(),
			content: v.string(),
			publishedAt: v.string(),
			image: v.optional(v.string()),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const post = await ctx.db
			.query("blogPosts")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!post) {
			return null;
		}

		return {
			_id: post._id,
			_creationTime: post._creationTime,
			slug: post.slug,
			title: post.title,
			summary: post.summary,
			content: post.content,
			publishedAt: post.publishedAt,
			image: post.image,
		};
	},
});

// Public mutation for syncing blog posts from markdown files
export const syncPostsPublic = mutation({
	args: {
		posts: v.array(
			v.object({
				slug: v.string(),
				title: v.string(),
				summary: v.string(),
				content: v.string(),
				publishedAt: v.string(),
				image: v.optional(v.string()),
			}),
		),
	},
	returns: v.object({
		created: v.number(),
		updated: v.number(),
		deleted: v.number(),
	}),
	handler: async (ctx, args) => {
		let created = 0;
		let updated = 0;
		let deleted = 0;

		const now = Date.now();
		const incomingSlugs = new Set(args.posts.map((p) => p.slug));

		// Get all existing posts
		const existingPosts = await ctx.db.query("blogPosts").collect();
		const existingBySlug = new Map(existingPosts.map((p) => [p.slug, p]));

		// Upsert incoming posts
		for (const post of args.posts) {
			const existing = existingBySlug.get(post.slug);

			if (existing) {
				// Update existing post
				await ctx.db.patch(existing._id, {
					title: post.title,
					summary: post.summary,
					content: post.content,
					publishedAt: post.publishedAt,
					image: post.image,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				// Create new post
				await ctx.db.insert("blogPosts", {
					...post,
					lastSyncedAt: now,
				});
				created++;
			}
		}

		// Delete posts that no longer exist in the repo
		for (const existing of existingPosts) {
			if (!incomingSlugs.has(existing.slug)) {
				await ctx.db.delete(existing._id);
				deleted++;
			}
		}

		return { created, updated, deleted };
	},
});

