import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { assertValidSyncSecret } from "./lib/syncAuth";
import { assertCompleteSync } from "./lib/syncPayload";

const MAX_EVENTS = 100;

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
			.order("desc")
			.take(MAX_EVENTS);

		// Return without content for list view
		return events.map((event) => ({
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
		const content = await ctx.db
			.query("talkEventContents")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();

		if (!content) {
			throw new ConvexError("Talk event content is missing");
		}

		return {
			_id: event._id,
			_creationTime: event._creationTime,
			slug: event.slug,
			title: event.title,
			summary: event.summary,
			content: content.content,
			publishedAt: event.publishedAt,
			image: event.image,
		};
	},
});

// Public mutation for syncing talk events from markdown files
export const syncEventsPublic = mutation({
	args: {
		syncSecret: v.string(),
		slugs: v.array(v.string()),
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
		assertValidSyncSecret(args.syncSecret);
		assertCompleteSync(args.slugs, args.events);

		let created = 0;
		let updated = 0;
		let deleted = 0;

		const now = Date.now();
		const incomingSlugs = new Set(args.events.map((e) => e.slug));

		// Get all existing events
		const [existingEvents, existingContents] = await Promise.all([
			ctx.db.query("talkEvents").collect(),
			ctx.db.query("talkEventContents").collect(),
		]);
		const existingBySlug = new Map(existingEvents.map((e) => [e.slug, e]));
		const existingContentBySlug = new Map(
			existingContents.map((content) => [content.slug, content]),
		);

		// Upsert incoming events
		for (const event of args.events) {
			const existing = existingBySlug.get(event.slug);
			const existingContent = existingContentBySlug.get(event.slug);

			if (existing) {
				// Update existing event
				await ctx.db.replace(existing._id, {
					slug: event.slug,
					title: event.title,
					summary: event.summary,
					publishedAt: event.publishedAt,
					image: event.image,
					lastSyncedAt: now,
				});
				updated++;
			} else {
				// Create new event
				await ctx.db.insert("talkEvents", {
					slug: event.slug,
					title: event.title,
					summary: event.summary,
					publishedAt: event.publishedAt,
					image: event.image,
					lastSyncedAt: now,
				});
				created++;
			}
			if (existingContent) {
				await ctx.db.replace(existingContent._id, {
					slug: event.slug,
					content: event.content,
					lastSyncedAt: now,
				});
			} else {
				await ctx.db.insert("talkEventContents", {
					slug: event.slug,
					content: event.content,
					lastSyncedAt: now,
				});
			}
		}

		// Delete events that no longer exist in the repo
		for (const existing of existingEvents) {
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
