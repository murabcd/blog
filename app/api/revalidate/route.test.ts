import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { publicContentCacheTags } from "@/lib/public-content-cache-policy";

const mocks = vi.hoisted(() => ({
	error: vi.fn(),
	info: vi.fn(),
	revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
	revalidateTag: mocks.revalidateTag,
}));

vi.mock("@/lib/logger", () => ({
	logger: {
		error: mocks.error,
		info: mocks.info,
	},
}));

import { POST } from "./route";

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv("REVALIDATE_SECRET", "test-secret");
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("POST /api/revalidate", () => {
	test.each(
		Object.values(publicContentCacheTags),
	)("expires %s before the next request", async (tag) => {
		const response = await POST(
			new Request("https://example.com/api/revalidate", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-forwarded-for": "192.0.2.1",
					"x-request-id": "revalidate-test",
					"x-revalidate-secret": "test-secret",
				},
				body: JSON.stringify({ tags: [tag] }),
			}),
		);

		expect(response.status).toBe(200);
		expect(mocks.revalidateTag).toHaveBeenCalledExactlyOnceWith(tag, {
			expire: 0,
		});
	});
});
