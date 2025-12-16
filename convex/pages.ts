import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all published static pages
export const getAllPages = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("staticPages"),
			slug: v.string(),
			title: v.string(),
			published: v.boolean(),
		}),
	),
	handler: async (ctx) => {
		const pages = await ctx.db
			.query("staticPages")
			.withIndex("by_published", (q) => q.eq("published", true))
			.collect();

		return pages.map((page) => ({
			_id: page._id,
			slug: page.slug,
			title: page.title,
			published: page.published,
		}));
	},
});

// Get a single static page by slug
export const getPageBySlug = query({
	args: {
		slug: v.string(),
	},
	returns: v.union(
		v.object({
			_id: v.id("staticPages"),
			slug: v.string(),
			title: v.string(),
			content: v.string(),
			published: v.boolean(),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const page = await ctx.db
			.query("staticPages")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!page || !page.published) {
			return null;
		}

		return {
			_id: page._id,
			slug: page.slug,
			title: page.title,
			content: page.content,
			published: page.published,
		};
	},
});

// Public mutation for syncing static pages from markdown files
export const syncPagesPublic = mutation({
	args: {
		pages: v.array(
			v.object({
				slug: v.string(),
				title: v.string(),
				content: v.string(),
				published: v.boolean(),
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
		const incomingSlugs = new Set(args.pages.map((p) => p.slug));

		// Get all existing pages
		const existingPages = await ctx.db.query("staticPages").collect();
		const existingBySlug = new Map(existingPages.map((p) => [p.slug, p]));

		// Upsert incoming pages
		for (const page of args.pages) {
			const existing = existingBySlug.get(page.slug);

			if (existing) {
				// Update existing page
				await ctx.db.patch(existing._id, {
					title: page.title,
					content: page.content,
					published: page.published,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				// Create new page
				await ctx.db.insert("staticPages", {
					...page,
					lastSyncedAt: now,
				});
				created++;
			}
		}

		// Delete pages that no longer exist in the repo
		for (const existing of existingPages) {
			if (!incomingSlugs.has(existing.slug)) {
				await ctx.db.delete(existing._id);
				deleted++;
			}
		}

		return { created, updated, deleted };
	},
});

