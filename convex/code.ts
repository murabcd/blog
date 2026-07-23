import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { assertValidSyncSecret } from "./lib/syncAuth";
import { assertCompleteSync, assertStoredSyncLimit } from "./lib/syncPayload";
import { codeProjectValidator } from "../lib/content-catalog/model";

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
			.withIndex("by_published_and_date", (q) => q.eq("published", true))
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
			.unique();

		if (!project || !project.published) {
			return null;
		}

		const content = await ctx.db
			.query("codeProjectContents")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.unique();

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
		projects: v.array(codeProjectValidator),
	},
	returns: v.object({
		created: v.number(),
		updated: v.number(),
		deleted: v.number(),
	}),
	handler: async (ctx, args) => {
		assertValidSyncSecret(args.syncSecret);
		assertCompleteSync(args.slugs, args.projects, MAX_PROJECTS);

		const now = Date.now();
		const incomingSlugs = new Set(args.projects.map((p) => p.slug));

		const [existingProjects, existingContents] = await Promise.all([
			ctx.db.query("codeProjects").take(MAX_PROJECTS + 1),
			ctx.db.query("codeProjectContents").take(MAX_PROJECTS + 1),
		]);
		assertStoredSyncLimit(existingProjects.length, MAX_PROJECTS);
		assertStoredSyncLimit(existingContents.length, MAX_PROJECTS);
		const existingBySlug = new Map(existingProjects.map((p) => [p.slug, p]));
		const existingContentBySlug = new Map(
			existingContents.map((content) => [content.slug, content]),
		);

		const created = args.projects.filter(
			(project) => !existingBySlug.has(project.slug),
		).length;
		const updated = args.projects.length - created;
		const projectsToDelete = existingProjects.filter(
			(project) => !incomingSlugs.has(project.slug),
		);
		const contentsToDelete = existingContents.filter(
			(content) => !incomingSlugs.has(content.slug),
		);

		const upserts = args.projects.flatMap((project) => {
			const existing = existingBySlug.get(project.slug);
			const existingContent = existingContentBySlug.get(project.slug);
			const projectWrite = existing
				? ctx.db.replace(existing._id, {
						slug: project.slug,
						title: project.title,
						href: project.href,
						date: project.date,
						published: project.published,
						lastSyncedAt: now,
					})
				: ctx.db.insert("codeProjects", {
						slug: project.slug,
						title: project.title,
						href: project.href,
						date: project.date,
						published: project.published,
						lastSyncedAt: now,
					});
			const contentWrite = existingContent
				? ctx.db.replace(existingContent._id, {
						slug: project.slug,
						content: project.content,
						lastSyncedAt: now,
					})
				: ctx.db.insert("codeProjectContents", {
						slug: project.slug,
						content: project.content,
						lastSyncedAt: now,
					});

			return [projectWrite, contentWrite];
		});

		await Promise.all([
			...upserts,
			...projectsToDelete.map((project) => ctx.db.delete(project._id)),
			...contentsToDelete.map((content) => ctx.db.delete(content._id)),
		]);

		return { created, updated, deleted: projectsToDelete.length };
	},
});
