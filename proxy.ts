import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createApiErrorResponse } from "./lib/api-error";
import { readBlogPosts, readTalkEvents } from "./lib/content-catalog";
import { createHomeMarkdown } from "./lib/home-content";

const MARKDOWN_HEADERS = {
	"Content-Type": "text/markdown; charset=utf-8",
	Vary: "Accept, Accept-Encoding",
};

const REPRESENTATIONS = ["text/html", "text/markdown"] as const;

type Representation = (typeof REPRESENTATIONS)[number];

type MediaRange = {
	mediaType: string;
	position: number;
	quality: number;
	specificity: number;
};

// Reject unknown slugs before Cache Components can stream an empty error shell.
// This is the same source catalog used by the sitemap and Markdown endpoints.
const contentPaths = [
	...readBlogPosts(process.cwd()).map(({ slug }) => `/blog/${slug}`),
	...readTalkEvents(process.cwd()).map(({ slug }) => `/talk/${slug}`),
];

const KNOWN_PUBLIC_PATHS = new Set([
	"/",
	"/blog",
	"/blog/twitter-image",
	"/chat",
	"/chat/twitter-image",
	"/code",
	"/code/twitter-image",
	"/llms.txt",
	"/openapi.json",
	"/opengraph-image",
	"/robots.txt",
	"/sitemap.xml",
	"/talk",
	"/talk/twitter-image",
	"/twitter-image",
	...contentPaths.flatMap((path) => [
		path,
		`${path}/opengraph-image`,
		`${path}/twitter-image`,
	]),
]);

function isKnownApiPath(pathname: string) {
	return (
		pathname === "/api/rss" ||
		pathname === "/api/revalidate" ||
		/^\/api\/blog\/[^/]+\/md$/.test(pathname)
	);
}

function parseAccept(acceptHeader: string): MediaRange[] {
	return acceptHeader.split(",").map((entry, position) => {
		const [rawMediaType = "", ...parameters] = entry
			.trim()
			.split(";")
			.map((part) => part.trim());
		let quality = 1;

		for (const parameter of parameters) {
			const [name, value] = parameter.split("=").map((part) => part.trim());
			if (name?.toLowerCase() !== "q") continue;

			const parsedQuality = Number(value);
			if (Number.isFinite(parsedQuality)) {
				quality = Math.max(0, Math.min(1, parsedQuality));
			}
		}

		const mediaType = rawMediaType.toLowerCase();
		const specificity =
			mediaType === "*/*" ? 0 : mediaType.endsWith("/*") ? 1 : 2;

		return { mediaType, position, quality, specificity };
	});
}

function matchesRepresentation(range: MediaRange, candidate: Representation) {
	if (range.mediaType === "*/*") return true;
	if (range.mediaType.endsWith("/*")) {
		return candidate.startsWith(range.mediaType.slice(0, -1));
	}
	return range.mediaType === candidate;
}

function preferredRepresentation(
	acceptHeader: string | null,
): Representation | null {
	if (!acceptHeader) return "text/html";

	const ranges = parseAccept(acceptHeader);
	let preferred: Representation | null = null;
	let preferredPosition = Number.POSITIVE_INFINITY;
	let preferredQuality = -1;

	for (const candidate of REPRESENTATIONS) {
		const matches = ranges.filter((range) =>
			matchesRepresentation(range, candidate),
		);
		const mostSpecific = Math.max(
			...matches.map((range) => range.specificity),
			-1,
		);
		const match = matches.find((range) => range.specificity === mostSpecific);

		if (!match || match.quality <= 0) continue;
		if (
			match.quality > preferredQuality ||
			(match.quality === preferredQuality && match.position < preferredPosition)
		) {
			preferred = candidate;
			preferredQuality = match.quality;
			preferredPosition = match.position;
		}
	}

	return preferred;
}

function normalizePathname(pathname: string) {
	if (pathname === "/") return pathname;
	return pathname.replace(/\/+$/, "");
}

function isKnownPublicPath(pathname: string) {
	return KNOWN_PUBLIC_PATHS.has(pathname) || isKnownApiPath(pathname);
}

function createMarkdownNotFound(request: NextRequest) {
	const url = (pathname: string) => new URL(pathname, request.url).toString();
	const body = [
		"# 404 - Page not found",
		"",
		"The requested page does not exist. Use one of these indexes to continue:",
		"",
		`- [Machine-readable site index](${url("/llms.txt")})`,
		`- [XML sitemap](${url("/sitemap.xml")})`,
		`- [Home](${url("/")})`,
		"",
	].join("\n");

	return new Response(body, {
		status: 404,
		headers: MARKDOWN_HEADERS,
	});
}

export function proxy(request: NextRequest) {
	const acceptHeader = request.headers.get("accept");
	const preferred = preferredRepresentation(acceptHeader);
	const { pathname } = request.nextUrl;
	const normalizedPathname = normalizePathname(pathname);

	if (
		normalizedPathname.startsWith("/api/") &&
		!isKnownApiPath(normalizedPathname)
	) {
		return createApiErrorResponse({
			code: "api_route_not_found",
			message: "The requested API endpoint does not exist.",
			resolution: "Use /openapi.json to discover supported API endpoints.",
			status: 404,
		});
	}

	if (pathname === "/") {
		if (preferred === "text/markdown") {
			return new Response(createHomeMarkdown(request.url), {
				headers: MARKDOWN_HEADERS,
			});
		}
		if (preferred === null && acceptHeader) {
			return new Response(
				"Not Acceptable\n\nAvailable: text/html, text/markdown\n",
				{
					status: 406,
					headers: {
						"Content-Type": "text/plain; charset=utf-8",
						Vary: MARKDOWN_HEADERS.Vary,
					},
				},
			);
		}

		return NextResponse.next();
	}

	if (preferred === "text/markdown" && !isKnownPublicPath(normalizedPathname)) {
		return createMarkdownNotFound(request);
	}

	if (normalizedPathname === "/404") {
		return NextResponse.next({ status: 404 });
	}

	if (
		/^\/(blog|talk)\/[^/]+$/.test(normalizedPathname) &&
		!isKnownPublicPath(normalizedPathname)
	) {
		return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
