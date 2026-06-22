import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { assertValidSyncSecret } from "./lib/syncAuth";
import { assertCompleteSync } from "./lib/syncPayload";

const MAX_PROJECTS = 100;

// Get all published code projects, sorted by date descending
export const getAllProjects = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("codeProjects"),
			_creationTime: v.number(),
			slug: v.string(),
			title: v.string(),
			href: v.string(),
			date: v.string(),
			published: v.boolean(),
		}),
	),
	handler: async (ctx) => {
		const projects = await ctx.db
			.query("codeProjects")
			.withIndex("by_published_date", (q) => q.eq("published", true))
			.order("desc")
			.take(MAX_PROJECTS);

		return projects.map((project) => ({
			_id: project._id,
			_creationTime: project._creationTime,
			slug: project.slug,
			title: project.title,
			href: project.href,
			date: project.date,
			published: project.published,
		}));
	},
});

// Get a single code project by slug
export const getProjectBySlug = query({
	args: {
		slug: v.string(),
	},
	returns: v.union(
		v.object({
			_id: v.id("codeProjects"),
			_creationTime: v.number(),
			slug: v.string(),
			title: v.string(),
			href: v.string(),
			date: v.string(),
			content: v.string(),
			published: v.boolean(),
		}),
		v.null(),
	),
	handler: async (ctx, args) => {
		const project = await ctx.db
			.query("codeProjects")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!project || !project.published) {
			return null;
		}

		const content = await ctx.db
			.query("codeProjectContents")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!content) {
			throw new ConvexError("Code project content is missing");
		}

		return {
			_id: project._id,
			_creationTime: project._creationTime,
			slug: project.slug,
			title: project.title,
			href: project.href,
			date: project.date,
			content: content.content,
			published: project.published,
		};
	},
});

// Public mutation for syncing code projects from markdown files
export const syncProjectsPublic = mutation({
	args: {
		syncSecret: v.string(),
		slugs: v.array(v.string()),
		projects: v.array(
			v.object({
				slug: v.string(),
				title: v.string(),
				href: v.string(),
				date: v.string(),
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
		assertCompleteSync(args.slugs, args.projects);

		let created = 0;
		let updated = 0;
		let deleted = 0;

		const now = Date.now();
		const incomingSlugs = new Set(args.projects.map((p) => p.slug));

		const [existingProjects, existingContents] = await Promise.all([
			ctx.db.query("codeProjects").collect(),
			ctx.db.query("codeProjectContents").collect(),
		]);
		const existingBySlug = new Map(existingProjects.map((p) => [p.slug, p]));
		const existingContentBySlug = new Map(
			existingContents.map((content) => [content.slug, content]),
		);

		for (const project of args.projects) {
			const existing = existingBySlug.get(project.slug);
			const existingContent = existingContentBySlug.get(project.slug);

			if (existing) {
				await ctx.db.replace(existing._id, {
					slug: project.slug,
					title: project.title,
					href: project.href,
					date: project.date,
					published: project.published,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				await ctx.db.insert("codeProjects", {
					slug: project.slug,
					title: project.title,
					href: project.href,
					date: project.date,
					published: project.published,
					lastSyncedAt: now,
				});
				created++;
			}

			if (existingContent) {
				await ctx.db.replace(existingContent._id, {
					slug: project.slug,
					content: project.content,
					lastSyncedAt: now,
				});
			} else {
				await ctx.db.insert("codeProjectContents", {
					slug: project.slug,
					content: project.content,
					lastSyncedAt: now,
				});
			}
		}

		for (const existing of existingProjects) {
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
