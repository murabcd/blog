import { describe, expect, test } from "vitest";
import {
	isPublicContentCacheTag,
	publicContentCacheTags,
} from "./public-content-cache-policy";

describe("public content cache policy", () => {
	test("accepts every canonical tag", () => {
		for (const tag of Object.values(publicContentCacheTags)) {
			expect(isPublicContentCacheTag(tag)).toBe(true);
		}
	});

	test("rejects removed and unknown tags", () => {
		expect(isPublicContentCacheTag("pages")).toBe(false);
		expect(isPublicContentCacheTag("pages:chat")).toBe(false);
		expect(isPublicContentCacheTag("blogPost:example")).toBe(false);
		expect(isPublicContentCacheTag("unknown")).toBe(false);
	});
});
