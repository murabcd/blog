import { describe, expect, test, vi } from "vitest";
import type { ContentCatalog } from "../lib/content-catalog";
import type { PublicContentCacheTag } from "../lib/public-content-cache-policy";
import { publishContent, type PublicationBatch } from "./content-publication";

const catalog: ContentCatalog = {
	blogPosts: [
		{
			slug: "post",
			title: "Post",
			summary: "Summary",
			content: "Body",
			publishedAt: "2026-01-01",
		},
	],
	talkEvents: [
		{
			slug: "talk",
			title: "Talk",
			summary: "Summary",
			content: "Body",
			publishedAt: "2026-01-02",
		},
	],
	codeProjects: [
		{
			slug: "project",
			title: "Project",
			href: "https://example.com",
			date: "2026-01-03",
			content: "Body",
			published: true,
		},
	],
	staticPages: [
		{
			slug: "chat",
			title: "Chat",
			content: "Body",
			published: true,
		},
	],
};

describe("publishContent", () => {
	test("publishes and invalidates every catalog collection", async () => {
		const events: string[] = [];
		const publish = vi.fn(async (batch: PublicationBatch) => {
			events.push(`publish:${batch.kind}`);
			return { created: batch.items.length, updated: 0, deleted: 0 };
		});
		const invalidate = vi.fn(async (tag: PublicContentCacheTag) => {
			events.push(`invalidate:${tag}`);
		});

		await expect(
			publishContent(catalog, { publish, invalidate }),
		).resolves.toEqual([
			{
				kind: "blogPosts",
				label: "Blog posts",
				created: 1,
				updated: 0,
				deleted: 0,
			},
			{
				kind: "talkEvents",
				label: "Talk events",
				created: 1,
				updated: 0,
				deleted: 0,
			},
			{
				kind: "codeProjects",
				label: "Code projects",
				created: 1,
				updated: 0,
				deleted: 0,
			},
			{
				kind: "staticPages",
				label: "Static pages",
				created: 1,
				updated: 0,
				deleted: 0,
			},
		]);
		expect(publish).toHaveBeenCalledTimes(4);
		expect(invalidate).toHaveBeenCalledTimes(4);

		for (const kind of [
			"blogPosts",
			"talkEvents",
			"codeProjects",
			"staticPages",
		]) {
			expect(events.indexOf(`publish:${kind}`)).toBeLessThan(
				events.indexOf(`invalidate:${kind}`),
			);
		}
	});

	test("reports every collection failure after all work settles", async () => {
		const publish = vi.fn(async (batch: PublicationBatch) => {
			if (batch.kind === "blogPosts" || batch.kind === "codeProjects") {
				throw new Error("remote failure");
			}
			return { created: 0, updated: 1, deleted: 0 };
		});
		const invalidate = vi.fn(async () => undefined);

		try {
			await publishContent(catalog, { publish, invalidate });
			throw new Error("Expected publication to fail");
		} catch (error) {
			expect(error).toBeInstanceOf(AggregateError);
			expect(error).toHaveProperty(
				"message",
				"Failed to publish Blog posts; Failed to publish Code projects",
			);
		}
		expect(publish).toHaveBeenCalledTimes(4);
		expect(invalidate).toHaveBeenCalledTimes(2);
	});

	test("distinguishes invalidation failure after a committed publication", async () => {
		await expect(
			publishContent(catalog, {
				publish: vi.fn(async () => ({ created: 0, updated: 1, deleted: 0 })),
				invalidate: vi.fn(async (tag) => {
					if (tag === "talkEvents") {
						throw new Error("endpoint unavailable");
					}
				}),
			}),
		).rejects.toThrow("Published Talk events, but cache invalidation failed");
	});
});
