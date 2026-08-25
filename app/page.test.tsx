import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HomePage } from "./page";

describe("HomePage", () => {
	test("renders meaningful content with a semantic heading hierarchy", () => {
		const html = renderToStaticMarkup(<HomePage posts={[]} />);

		expect(html).toContain("<h1");
		expect(html).toContain(">Murad Abdulkadyrov</h1>");
		expect(html).toContain(
			'<h2 class="mb-4 text-sm font-medium text-muted-foreground">Latest writing</h2>',
		);
		expect(html).not.toContain("sr-only");
		expect(html.replace(/<[^>]+>/g, "").length).toBeGreaterThan(500);
	});
});
