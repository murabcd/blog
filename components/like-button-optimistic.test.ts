import type { OptimisticLocalStore } from "convex/browser";
import { getFunctionName } from "convex/server";
import { describe, expect, test } from "vitest";
import { api } from "../convex/_generated/api";
import { optimisticallyToggleLike } from "./like-button-optimistic";

function createLocalStore({
	likeCount,
	isLiked,
}: {
	likeCount: number | undefined;
	isLiked: boolean | undefined;
}) {
	const values = new Map<string, number | boolean | undefined>([
		[getFunctionName(api.posts.getLikeCount), likeCount],
		[getFunctionName(api.posts.getIsLiked), isLiked],
	]);

	const getQuery = ((query: Parameters<OptimisticLocalStore["getQuery"]>[0]) =>
		values.get(getFunctionName(query))) as OptimisticLocalStore["getQuery"];
	const setQuery = ((
		query: Parameters<OptimisticLocalStore["setQuery"]>[0],
		_args: Parameters<OptimisticLocalStore["setQuery"]>[1],
		value: Parameters<OptimisticLocalStore["setQuery"]>[2],
	) => {
		values.set(getFunctionName(query), value as number | boolean | undefined);
	}) as OptimisticLocalStore["setQuery"];

	return {
		localStore: {
			getQuery,
			getAllQueries: (() => []) as OptimisticLocalStore["getAllQueries"],
			setQuery,
		},
		values,
	};
}

describe("optimisticallyToggleLike", () => {
	test("likes immediately in both loaded query results", () => {
		const { localStore, values } = createLocalStore({
			likeCount: 7,
			isLiked: false,
		});

		optimisticallyToggleLike(localStore, {
			postSlug: "test-post",
			visitorId: "visitor-1",
		});

		expect(values.get(getFunctionName(api.posts.getLikeCount))).toBe(8);
		expect(values.get(getFunctionName(api.posts.getIsLiked))).toBe(true);
	});

	test("unlikes immediately without allowing a negative count", () => {
		const { localStore, values } = createLocalStore({
			likeCount: 0,
			isLiked: true,
		});

		optimisticallyToggleLike(localStore, {
			postSlug: "test-post",
			visitorId: "visitor-1",
		});

		expect(values.get(getFunctionName(api.posts.getLikeCount))).toBe(0);
		expect(values.get(getFunctionName(api.posts.getIsLiked))).toBe(false);
	});

	test("does not create partial optimistic state while either query is loading", () => {
		const { localStore, values } = createLocalStore({
			likeCount: undefined,
			isLiked: false,
		});

		optimisticallyToggleLike(localStore, {
			postSlug: "test-post",
			visitorId: "visitor-1",
		});

		expect(values.get(getFunctionName(api.posts.getLikeCount))).toBeUndefined();
		expect(values.get(getFunctionName(api.posts.getIsLiked))).toBe(false);
	});
});
