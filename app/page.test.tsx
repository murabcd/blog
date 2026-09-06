import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HomePage } from "./page";

describe("HomePage", () => {
	test("renders meaningful content with a semantic heading hierarchy", () => {
		const html = renderToStaticMarkup(
			<HomePage
				posts={[
					{
						publishedAt: "2026-08-25",
						slug: "semantic-html",
						title: "Semantic HTML",
					},
				]}
			/>,
		);

		expect(html).toContain("<h1");
		expect(html).toContain(">Murad Abdulkadyrov</h1>");
		expect(html).not.toContain("Latest writing");
		expect(html).not.toContain("sr-only");
		expect(html).toContain(
			'<h2 class="text-foreground tracking-tight group-hover:underline">Semantic HTML</h2>',
		);
		const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
		expect(visibleHtml.replace(/<[^>]+>/g, "").length).toBeGreaterThan(500);
	});
});
