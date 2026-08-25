import type { OptimisticLocalStore } from "convex/browser";
import type { FunctionArgs } from "convex/server";
import { api } from "../convex/_generated/api";

type ToggleLikeArgs = FunctionArgs<typeof api.posts.toggleLike>;

export function optimisticallyToggleLike(
	localStore: OptimisticLocalStore,
	args: ToggleLikeArgs,
) {
	const likeCountArgs = { postSlug: args.postSlug };
	const likeCount = localStore.getQuery(api.posts.getLikeCount, likeCountArgs);
	const isLiked = localStore.getQuery(api.posts.getIsLiked, args);

	if (likeCount === undefined || isLiked === undefined) return;

	localStore.setQuery(
		api.posts.getLikeCount,
		likeCountArgs,
		Math.max(0, likeCount + (isLiked ? -1 : 1)),
	);
	localStore.setQuery(api.posts.getIsLiked, args, !isLiked);
}
