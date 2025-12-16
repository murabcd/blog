import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
			content: v.string(),
			published: v.boolean(),
		}),
	),
	handler: async (ctx) => {
		const projects = await ctx.db
			.query("codeProjects")
			.withIndex("by_published", (q) => q.eq("published", true))
			.collect();

		// Sort by date descending
		const sortedProjects = projects.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
		);

		// Return without lastSyncedAt
		return sortedProjects.map((project) => ({
			_id: project._id,
			_creationTime: project._creationTime,
			slug: project.slug,
			title: project.title,
			href: project.href,
			date: project.date,
			content: project.content,
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

		// Return without lastSyncedAt
		return {
			_id: project._id,
			_creationTime: project._creationTime,
			slug: project.slug,
			title: project.title,
			href: project.href,
			date: project.date,
			content: project.content,
			published: project.published,
		};
	},
});

// Public mutation for syncing code projects from markdown files
export const syncProjectsPublic = mutation({
	args: {
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
		let created = 0;
		let updated = 0;
		let deleted = 0;

		const now = Date.now();
		const incomingSlugs = new Set(args.projects.map((p) => p.slug));

		// Get all existing projects
		const existingProjects = await ctx.db.query("codeProjects").collect();
		const existingBySlug = new Map(existingProjects.map((p) => [p.slug, p]));

		// Upsert incoming projects
		for (const project of args.projects) {
			const existing = existingBySlug.get(project.slug);

			if (existing) {
				// Update existing project
				await ctx.db.patch(existing._id, {
					title: project.title,
					href: project.href,
					date: project.date,
					content: project.content,
					published: project.published,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				// Create new project
				await ctx.db.insert("codeProjects", {
					...project,
					lastSyncedAt: now,
				});
				created++;
			}
		}

		// Delete projects that no longer exist in the repo
		for (const existing of existingProjects) {
			if (!incomingSlugs.has(existing.slug)) {
				await ctx.db.delete(existing._id);
				deleted++;
			}
		}

		return { created, updated, deleted };
	},
});
