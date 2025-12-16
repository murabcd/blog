import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all published talk events, sorted by publishedAt descending
export const getAllEvents = query({
	args: {},
	returns: v.array(
		v.object({
			_id: v.id("talkEvents"),
			_creationTime: v.number(),
			slug: v.string(),
			title: v.string(),
			summary: v.string(),
			publishedAt: v.string(),
			image: v.optional(v.string()),
		}),
	),
	handler: async (ctx) => {
		const events = await ctx.db
			.query("talkEvents")
			.withIndex("by_publishedAt")
			.collect();

		// Sort by publishedAt descending
		const sortedEvents = events.sort(
			(a, b) =>
				new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
		);

		// Return without content for list view
		return sortedEvents.map((event) => ({
			_id: event._id,
			_creationTime: event._creationTime,
			slug: event.slug,
			title: event.title,
			summary: event.summary,
			publishedAt: event.publishedAt,
			image: event.image,
		}));
	},
});

// Get a single talk event by slug
export const getEventBySlug = query({
	args: {
		slug: v.string(),
	},
	returns: v.union(
		v.object({
			_id: v.id("talkEvents"),
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
		const event = await ctx.db
			.query("talkEvents")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!event) {
			return null;
		}

		return {
			_id: event._id,
			_creationTime: event._creationTime,
			slug: event.slug,
			title: event.title,
			summary: event.summary,
			content: event.content,
			publishedAt: event.publishedAt,
			image: event.image,
		};
	},
});

// Public mutation for syncing talk events from markdown files
export const syncEventsPublic = mutation({
	args: {
		events: v.array(
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
		const incomingSlugs = new Set(args.events.map((e) => e.slug));

		// Get all existing events
		const existingEvents = await ctx.db.query("talkEvents").collect();
		const existingBySlug = new Map(existingEvents.map((e) => [e.slug, e]));

		// Upsert incoming events
		for (const event of args.events) {
			const existing = existingBySlug.get(event.slug);

			if (existing) {
				// Update existing event
				await ctx.db.patch(existing._id, {
					title: event.title,
					summary: event.summary,
					content: event.content,
					publishedAt: event.publishedAt,
					image: event.image,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				// Create new event
				await ctx.db.insert("talkEvents", {
					...event,
					lastSyncedAt: now,
				});
				created++;
			}
		}

		// Delete events that no longer exist in the repo
		for (const existing of existingEvents) {
			if (!incomingSlugs.has(existing.slug)) {
				await ctx.db.delete(existing._id);
				deleted++;
			}
		}

		return { created, updated, deleted };
	},
});

