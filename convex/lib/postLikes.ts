import { TableAggregate } from "@convex-dev/aggregate";
import { ConvexError } from "convex/values";
import { components } from "../_generated/api";
import type { DataModel, Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const MAX_LIKE_DELETIONS_PER_SYNC = 1_000;

export const postLikesAggregate = new TableAggregate<{
	Namespace: string;
	Key: null;
	DataModel: DataModel;
	TableName: "postLikes";
}>(components.postLikes, {
	namespace: (doc) => doc.postSlug,
	sortKey: () => null,
});

export async function insertPostLike(
	ctx: MutationCtx,
	like: Omit<Doc<"postLikes">, "_id" | "_creationTime">,
) {
	const id = await ctx.db.insert("postLikes", like);
	const document = await ctx.db.get(id);

	if (!document) {
		throw new Error("Inserted post like is missing");
	}

	await postLikesAggregate.insert(ctx, document);
}

export async function deletePostLike(ctx: MutationCtx, like: Doc<"postLikes">) {
	await postLikesAggregate.delete(ctx, like);
	await ctx.db.delete(like._id);
}

export async function deletePostLikes(
	ctx: MutationCtx,
	postSlugs: readonly string[],
) {
	const likes: Doc<"postLikes">[] = [];

	for (const postSlug of postSlugs) {
		const remainingCapacity = MAX_LIKE_DELETIONS_PER_SYNC - likes.length;
		const postLikes = await ctx.db
			.query("postLikes")
			.withIndex("by_postSlug", (query) => query.eq("postSlug", postSlug))
			.take(remainingCapacity + 1);
		likes.push(...postLikes);

		if (likes.length > MAX_LIKE_DELETIONS_PER_SYNC) {
			throw new ConvexError(
				`Content sync cannot delete more than ${MAX_LIKE_DELETIONS_PER_SYNC} likes at once`,
			);
		}
	}

	await Promise.all([
		...postSlugs.map((postSlug) =>
			postLikesAggregate.clear(ctx, { namespace: postSlug }),
		),
		...likes.map((like) => ctx.db.delete(like._id)),
	]);
}
