import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock } from "./code-block";

vi.mock("@/components/code-copy-button", () => ({
	CodeCopyButton: () => null,
}));

describe("code block theme inheritance", () => {
	it.each([
		"python",
		"bash",
		"text",
	])("leaves %s foreground and shadows to the CSS theme", (language) => {
		const html = renderToStaticMarkup(
			<CodeBlock className={`language-${language}`}>
				{'value = "example"\nprint(value)\n'}
			</CodeBlock>,
		);
		const codeTag = html.match(/<code\b[^>]*>/)?.[0];
		expect(codeTag).toContain(`class="language-${language}"`);
		expect(codeTag).not.toMatch(/(?:color|text-shadow|font-family):/);
		expect(html).toContain("example");
	});
});
