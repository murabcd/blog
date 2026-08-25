import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HomePage } from "./page";

describe("HomePage", () => {
	test("renders meaningful content with a semantic heading hierarchy", () => {
		const html = renderToStaticMarkup(<HomePage posts={[]} />);

		expect(html).toContain("<h1");
		expect(html).toContain(">Murad Abdulkadyrov</h1>");
		expect(html).toContain('<h2 class="sr-only">Latest writing</h2>');
		expect(html.replace(/<[^>]+>/g, "").length).toBeGreaterThan(500);
	});
});
