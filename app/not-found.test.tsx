import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
	test("offers machine-readable recovery links", () => {
		const html = renderToStaticMarkup(<NotFound />);

		expect(html).toContain('href="/sitemap.xml"');
		expect(html).toContain('href="/llms.txt"');
		expect(html).toContain("machine-readable index");
	});
});
