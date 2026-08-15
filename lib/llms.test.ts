import { describe, expect, test } from "vitest";
import { createLlmsText } from "./llms";

describe("createLlmsText", () => {
	test("describes the current public content through canonical routes", () => {
		const manifest = createLlmsText({
			siteUrl: "https://example.com",
			blogPosts: [
				{
					slug: "older-post",
					title: "Older post",
					summary: "An older article.",
					publishedAt: "2026-01-01",
				},
				{
					slug: "ai-agents",
					title: "AI [Agents]",
					summary: "A practical\n guide to agents.",
					publishedAt: "2026-02-01",
				},
			],
			talkEvents: [
				{
					slug: "voice-ai",
					title: "Voice AI",
					summary: "A conference recap.",
					publishedAt: "2026-03-01",
				},
			],
			codeProjects: [
				{
					title: "Agent toolkit",
					href: "https://github.com/example/agent-toolkit",
					date: "2026-04-01",
				},
			],
		});

		expect(manifest).toContain(
			"# Murad Abdulkadyrov\n\n> Personal site and blog of Murad Abdulkadyrov, Chief Product Officer at Flomni, sharing practical lessons on building AI products and leading product teams, alongside talks and open-source work.",
		);
		expect(manifest).toContain(
			"[AI \\[Agents\\]](https://example.com/api/blog/ai-agents/md): Published 2026-02-01. A practical guide to agents.",
		);
		expect(manifest.indexOf("AI \\[Agents\\]")).toBeLessThan(
			manifest.indexOf("Older post"),
		);
		expect(manifest).toContain("[Voice AI](https://example.com/talk/voice-ai)");
		expect(manifest).toContain(
			"[Agent toolkit](https://github.com/example/agent-toolkit)",
		);
		expect(manifest).toContain("[RSS feed](https://example.com/api/rss)");
		expect(manifest).not.toContain("/api/post");
		expect(manifest).not.toContain("/rss.xml");
		expect(manifest.endsWith("\n")).toBe(true);
	});
});
