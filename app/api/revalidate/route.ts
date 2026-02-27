import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { logger } from "@/lib/logger";

type RevalidateRequest = {
	tags?: string[];
};

const ALLOWED_STATIC_TAGS = new Set([
	"blogPosts",
	"talkEvents",
	"codeProjects",
	"pages",
	"pages:chat",
]);

const TAG_WITH_SLUG_PREFIXES = ["blogPost:", "talkEvent:"] as const;
const TAG_SLUG_PATTERN = /^[a-z0-9-]+$/;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

type RateLimitEntry = {
	count: number;
	resetAt: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
	__revalidateRateLimitMap?: Map<string, RateLimitEntry>;
};
if (!globalRateLimitStore.__revalidateRateLimitMap) {
	globalRateLimitStore.__revalidateRateLimitMap = new Map();
}
const rateLimitMap = globalRateLimitStore.__revalidateRateLimitMap;

function getSecretHeader(request: Request) {
	return request.headers.get("x-revalidate-secret");
}

function isAllowedTag(tag: string) {
	if (ALLOWED_STATIC_TAGS.has(tag)) {
		return true;
	}

	for (const prefix of TAG_WITH_SLUG_PREFIXES) {
		if (tag.startsWith(prefix)) {
			const slug = tag.slice(prefix.length);
			return TAG_SLUG_PATTERN.test(slug);
		}
	}

	return false;
}

function getClientIp(request: Request) {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0]?.trim() ?? "unknown";
	}

	return (
		request.headers.get("x-real-ip") ??
		request.headers.get("cf-connecting-ip") ??
		"unknown"
	);
}

function isRateLimited(clientIp: string) {
	const now = Date.now();
	const current = rateLimitMap.get(clientIp);

	if (!current || current.resetAt <= now) {
		rateLimitMap.set(clientIp, {
			count: 1,
			resetAt: now + RATE_LIMIT_WINDOW_MS,
		});
		return false;
	}

	if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
		return true;
	}

	current.count += 1;
	return false;
}

function cleanupExpiredRateLimitEntries() {
	if (rateLimitMap.size < 1_000) {
		return;
	}

	const now = Date.now();
	for (const [ip, entry] of rateLimitMap.entries()) {
		if (entry.resetAt <= now) {
			rateLimitMap.delete(ip);
		}
	}
}

export async function POST(request: Request) {
	const startTime = Date.now();
	const requestId =
		request.headers.get("x-request-id") ??
		request.headers.get("x-vercel-id") ??
		crypto.randomUUID();
	const requestPath = new URL(request.url).pathname;
	const clientIp = getClientIp(request);
	const wideEvent: Record<string, unknown> = {
		event: "revalidate.request",
		method: "POST",
		path: requestPath,
		requestId,
		clientIp,
		outcome: "unknown",
	};

	let response: Response | null = null;
	try {
		cleanupExpiredRateLimitEntries();
		if (isRateLimited(clientIp)) {
			wideEvent.outcome = "rate_limited";
			response = NextResponse.json(
				{ ok: false, error: "Too many requests" },
				{ status: 429 },
			);
			return response;
		}

		const secret = getSecretHeader(request);
		const expected = process.env.REVALIDATE_SECRET;
		if (!expected || secret !== expected) {
			wideEvent.outcome = "unauthorized";
			response = NextResponse.json({ ok: false }, { status: 401 });
			return response;
		}

		let payload: RevalidateRequest | null = null;
		try {
			payload = (await request.json()) as RevalidateRequest;
		} catch {
			// Ignore invalid JSON
		}

		const tags = Array.isArray(payload?.tags) ? payload?.tags : [];
		wideEvent.tagsRequestedCount = tags.length;

		if (tags.length === 0) {
			wideEvent.outcome = "bad_request";
			response = NextResponse.json(
				{ ok: false, error: "Missing tags" },
				{ status: 400 },
			);
			return response;
		}

		const invalidTags = tags.filter((tag) => !isAllowedTag(tag));
		wideEvent.invalidTagsCount = invalidTags.length;
		if (invalidTags.length > 0) {
			wideEvent.outcome = "bad_request";
			response = NextResponse.json(
				{ ok: false, error: "Invalid tags", invalidTags },
				{ status: 400 },
			);
			return response;
		}

		for (const tag of tags) {
			revalidateTag(tag, "max");
		}

		wideEvent.outcome = "success";
		wideEvent.tagsAcceptedCount = tags.length;
		response = NextResponse.json({ ok: true, tags });
		return response;
	} catch (error) {
		wideEvent.outcome = "error";
		wideEvent.errorName = error instanceof Error ? error.name : "UnknownError";
		wideEvent.errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		throw error;
	} finally {
		wideEvent.statusCode = response?.status ?? 500;
		wideEvent.durationMs = Date.now() - startTime;

		if (wideEvent.outcome === "error") {
			logger.error(wideEvent);
		} else {
			logger.info(wideEvent);
		}
	}
}
