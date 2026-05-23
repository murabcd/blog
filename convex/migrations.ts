import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { assertValidSyncSecret } from "./lib/syncAuth";

const TABLES = [
	{
		metadataTable: "blogPosts",
		contentTable: "blogPostContents",
	},
	{
		metadataTable: "talkEvents",
		contentTable: "talkEventContents",
	},
	{
		metadataTable: "codeProjects",
		contentTable: "codeProjectContents",
	},
	{
		metadataTable: "staticPages",
		contentTable: "staticPageContents",
	},
] as const;

export const migrateSplitContentPublic = mutation({
	args: {
		syncSecret: v.string(),
	},
	returns: v.object({
		migrated: v.number(),
		cleaned: v.number(),
	}),
	handler: async (ctx, args) => {
		assertValidSyncSecret(args.syncSecret);

		let migrated = 0;
		let cleaned = 0;
		const now = Date.now();

		for (const { metadataTable, contentTable } of TABLES) {
			const docs = await ctx.db.query(metadataTable).collect();
			const contentDocs = await ctx.db.query(contentTable).collect();
			const contentBySlug = new Map(
				contentDocs.map((contentDoc) => [contentDoc.slug, contentDoc]),
			);

			for (const doc of docs) {
				if (!("content" in doc) || typeof doc.content !== "string") {
					continue;
				}

				const existingContent = contentBySlug.get(doc.slug);
				if (existingContent) {
					await ctx.db.patch(existingContent._id, {
						content: doc.content,
						lastSyncedAt: now,
					});
				} else {
					await ctx.db.insert(contentTable, {
						slug: doc.slug,
						content: doc.content,
						lastSyncedAt: now,
					});
				}
				migrated++;

				await ctx.db.patch(doc._id, { content: undefined });
				cleaned++;
			}
		}

		return { migrated, cleaned };
	},
});
