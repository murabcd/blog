import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { assertValidSyncSecret } from "./lib/syncAuth";
import { assertCompleteSync, assertStoredSyncLimit } from "./lib/syncPayload";
import { staticPageValidator } from "../lib/content-catalog/model";

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
			.unique();

		if (!page || !page.published) {
			return null;
		}

		const content = await ctx.db
			.query("staticPageContents")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

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
		pages: v.array(staticPageValidator),
	},
	returns: v.object({
		created: v.number(),
		updated: v.number(),
		deleted: v.number(),
	}),
	handler: async (ctx, args) => {
		assertValidSyncSecret(args.syncSecret);
		assertCompleteSync(args.slugs, args.pages, MAX_PAGES);

		const now = Date.now();
		const incomingSlugs = new Set(args.pages.map((p) => p.slug));

		const [existingPages, existingContents] = await Promise.all([
			ctx.db.query("staticPages").take(MAX_PAGES + 1),
			ctx.db.query("staticPageContents").take(MAX_PAGES + 1),
		]);
		assertStoredSyncLimit(existingPages.length, MAX_PAGES);
		assertStoredSyncLimit(existingContents.length, MAX_PAGES);
		const existingBySlug = new Map(existingPages.map((p) => [p.slug, p]));
		const existingContentBySlug = new Map(
			existingContents.map((content) => [content.slug, content]),
		);

		const created = args.pages.filter(
			(page) => !existingBySlug.has(page.slug),
		).length;
		const updated = args.pages.length - created;
		const pagesToDelete = existingPages.filter(
			(page) => !incomingSlugs.has(page.slug),
		);
		const contentsToDelete = existingContents.filter(
			(content) => !incomingSlugs.has(content.slug),
		);

		const upserts = args.pages.flatMap((page) => {
			const existing = existingBySlug.get(page.slug);
			const existingContent = existingContentBySlug.get(page.slug);
			const pageWrite = existing
				? ctx.db.replace(existing._id, {
						slug: page.slug,
						title: page.title,
						published: page.published,
						lastSyncedAt: now,
					})
				: ctx.db.insert("staticPages", {
						slug: page.slug,
						title: page.title,
						published: page.published,
						lastSyncedAt: now,
					});
			const contentWrite = existingContent
				? ctx.db.replace(existingContent._id, {
						slug: page.slug,
						content: page.content,
						lastSyncedAt: now,
					})
				: ctx.db.insert("staticPageContents", {
						slug: page.slug,
						content: page.content,
						lastSyncedAt: now,
					});

			return [pageWrite, contentWrite];
		});

		await Promise.all([
			...upserts,
			...pagesToDelete.map((page) => ctx.db.delete(page._id)),
			...contentsToDelete.map((content) => ctx.db.delete(content._id)),
		]);

		return { created, updated, deleted: pagesToDelete.length };
	},
});
