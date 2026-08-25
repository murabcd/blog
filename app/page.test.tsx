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
		expect(html).toContain(
			'<h2 class="mb-4 text-sm font-medium text-muted-foreground">Latest writing</h2>',
		);
		expect(html).not.toContain("sr-only");
		expect(html).toContain(
			'<h3 class="text-foreground tracking-tight group-hover:underline">Semantic HTML</h3>',
		);
		expect(html.replace(/<[^>]+>/g, "").length).toBeGreaterThan(500);
	});
});
