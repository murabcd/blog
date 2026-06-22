import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { assertValidSyncSecret } from "./lib/syncAuth";
import { assertCompleteSync } from "./lib/syncPayload";

const MAX_PAGES = 100;

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
			.take(MAX_PAGES);

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

		const content = await ctx.db
			.query("staticPageContents")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!content) {
			throw new ConvexError("Static page content is missing");
		}

		return {
			_id: page._id,
			slug: page.slug,
			title: page.title,
			content: content.content,
			published: page.published,
		};
	},
});

// Public mutation for syncing static pages from markdown files
export const syncPagesPublic = mutation({
	args: {
		syncSecret: v.string(),
		slugs: v.array(v.string()),
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
		assertValidSyncSecret(args.syncSecret);
		assertCompleteSync(args.slugs, args.pages);

		let created = 0;
		let updated = 0;
		let deleted = 0;

		const now = Date.now();
		const incomingSlugs = new Set(args.pages.map((p) => p.slug));

		const [existingPages, existingContents] = await Promise.all([
			ctx.db.query("staticPages").collect(),
			ctx.db.query("staticPageContents").collect(),
		]);
		const existingBySlug = new Map(existingPages.map((p) => [p.slug, p]));
		const existingContentBySlug = new Map(
			existingContents.map((content) => [content.slug, content]),
		);

		for (const page of args.pages) {
			const existing = existingBySlug.get(page.slug);
			const existingContent = existingContentBySlug.get(page.slug);

			if (existing) {
				await ctx.db.replace(existing._id, {
					slug: page.slug,
					title: page.title,
					published: page.published,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				await ctx.db.insert("staticPages", {
					slug: page.slug,
					title: page.title,
					published: page.published,
					lastSyncedAt: now,
				});
				created++;
			}

			if (existingContent) {
				await ctx.db.replace(existingContent._id, {
					slug: page.slug,
					content: page.content,
					lastSyncedAt: now,
				});
			} else {
				await ctx.db.insert("staticPageContents", {
					slug: page.slug,
					content: page.content,
					lastSyncedAt: now,
				});
			}
		}

		for (const existing of existingPages) {
			if (!incomingSlugs.has(existing.slug)) {
				await ctx.db.delete(existing._id);
				deleted++;
			}
		}
		for (const existingContent of existingContents) {
			if (!incomingSlugs.has(existingContent.slug)) {
				await ctx.db.delete(existingContent._id);
			}
		}

		return { created, updated, deleted };
	},
});
