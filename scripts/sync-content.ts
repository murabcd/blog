import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import {
	type Frontmatter,
	getOptionalBoolean,
	getOptionalString,
	getRequiredString,
	toFrontmatter,
} from "../lib/frontmatter";
import dotenv from "dotenv";
import { revalidateContentCache } from "./revalidate-content-cache";

// Load environment variables based on SYNC_ENV
const isProduction = process.env.SYNC_ENV === "production";
const isVerbose =
	process.env.VERBOSE === "true" || process.argv.includes("--verbose");

const envFile = isProduction ? ".env.production.local" : ".env.local";
dotenv.config({ path: envFile, override: true });

const revalidateSecret = process.env.REVALIDATE_SECRET;
const contentSyncSecret = process.env.CONTENT_SYNC_SECRET;
const siteUrl =
	process.env.SITE_URL ||
	process.env.NEXT_PUBLIC_SITE_URL ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

if (isProduction) {
	console.log("Syncing to PRODUCTION deployment...\n");
}
if (isVerbose) {
	console.log(`Loaded env from ${envFile}`);
	if (process.env.CONVEX_DEPLOYMENT) {
		console.log(`CONVEX_DEPLOYMENT=${process.env.CONVEX_DEPLOYMENT}`);
	}
	if (process.env.NEXT_PUBLIC_CONVEX_URL) {
		console.log(`NEXT_PUBLIC_CONVEX_URL=${process.env.NEXT_PUBLIC_CONVEX_URL}`);
	}
	if (process.env.CONVEX_URL) {
		console.log(`CONVEX_URL=${process.env.CONVEX_URL}`);
	}
	if (siteUrl) {
		console.log(`SITE_URL=${siteUrl}`);
	}
	console.log("");
}

// Content directories
const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const TALK_DIR = path.join(process.cwd(), "content", "talk");
const CODE_DIR = path.join(process.cwd(), "content", "code");
const CHAT_FILE = path.join(process.cwd(), "content", "chat.md");

interface BlogPostFrontmatter {
	title: string;
	publishedAt: string;
	summary: string;
	image?: string;
}

interface ParsedBlogPost {
	slug: string;
	title: string;
	summary: string;
	content: string;
	publishedAt: string;
	image?: string;
}

interface TalkEventFrontmatter {
	title: string;
	publishedAt: string;
	summary: string;
	image?: string;
}

interface ParsedTalkEvent {
	slug: string;
	title: string;
	summary: string;
	content: string;
	publishedAt: string;
	image?: string;
}

interface CodeProjectFrontmatter {
	title: string;
	href: string;
	date: string;
	published?: boolean;
}

interface ParsedCodeProject {
	slug: string;
	title: string;
	href: string;
	date: string;
	content: string;
	published: boolean;
}

interface StaticPageFrontmatter {
	title: string;
	published?: boolean;
}

interface ParsedStaticPage {
	slug: string;
	title: string;
	content: string;
	published: boolean;
}

// Parse a single MDX file (blog post or talk event)
function parseMDXFile(filePath: string): {
	metadata: Frontmatter;
	content: string;
} | null {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const { data, content } = matter(fileContent);
		return {
			metadata: toFrontmatter(data),
			content,
		};
	} catch (error) {
		console.error(`Error parsing ${filePath}:`, error);
		return null;
	}
}

// Parse blog post
function parseBlogPost(filePath: string): ParsedBlogPost | null {
	const parsed = parseMDXFile(filePath);
	if (!parsed) return null;

	const frontmatter: BlogPostFrontmatter = {
		title: getRequiredString(parsed.metadata, "title") ?? "",
		publishedAt: getRequiredString(parsed.metadata, "publishedAt") ?? "",
		summary: getRequiredString(parsed.metadata, "summary") ?? "",
		image: getOptionalString(parsed.metadata, "image"),
	};

	if (!frontmatter.title || !frontmatter.publishedAt || !frontmatter.summary) {
		console.warn(
			`Skipping ${filePath}: missing required frontmatter fields (title, publishedAt, summary)`,
		);
		return null;
	}

	const slug = path.basename(filePath, path.extname(filePath));

	return {
		slug,
		title: frontmatter.title,
		summary: frontmatter.summary,
		content: parsed.content.trim(),
		publishedAt: frontmatter.publishedAt,
		image: frontmatter.image,
	};
}

// Parse talk event
function parseTalkEvent(filePath: string): ParsedTalkEvent | null {
	const parsed = parseMDXFile(filePath);
	if (!parsed) return null;

	const frontmatter: TalkEventFrontmatter = {
		title: getRequiredString(parsed.metadata, "title") ?? "",
		publishedAt: getRequiredString(parsed.metadata, "publishedAt") ?? "",
		summary: getRequiredString(parsed.metadata, "summary") ?? "",
		image: getOptionalString(parsed.metadata, "image"),
	};

	if (!frontmatter.title || !frontmatter.publishedAt || !frontmatter.summary) {
		console.warn(
			`Skipping ${filePath}: missing required frontmatter fields (title, publishedAt, summary)`,
		);
		return null;
	}

	const slug = path.basename(filePath, path.extname(filePath));

	return {
		slug,
		title: frontmatter.title,
		summary: frontmatter.summary,
		content: parsed.content.trim(),
		publishedAt: frontmatter.publishedAt,
		image: frontmatter.image,
	};
}

// Parse code project
function parseCodeProject(filePath: string): ParsedCodeProject | null {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const { data, content } = matter(fileContent);

		const metadata = toFrontmatter(data);
		const frontmatter: Partial<CodeProjectFrontmatter> = {
			title: getRequiredString(metadata, "title") ?? undefined,
			href: getRequiredString(metadata, "href") ?? undefined,
			date: getRequiredString(metadata, "date") ?? undefined,
			published: getOptionalBoolean(metadata, "published"),
		};

		// Validate required fields
		if (!frontmatter.title || !frontmatter.href || !frontmatter.date) {
			console.warn(
				`Skipping ${filePath}: missing required frontmatter fields (title, href, date)`,
			);
			return null;
		}

		const slug = path.basename(filePath, path.extname(filePath));

		return {
			slug,
			title: frontmatter.title,
			href: frontmatter.href,
			date: frontmatter.date,
			content: content.trim(),
			published: frontmatter.published ?? true,
		};
	} catch (error) {
		console.error(`Error parsing ${filePath}:`, error);
		return null;
	}
}

// Parse static page (chat)
function parseStaticPage(
	filePath: string,
	slug: string,
): ParsedStaticPage | null {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const { data, content } = matter(fileContent);

		const metadata = toFrontmatter(data);
		const frontmatter: Partial<StaticPageFrontmatter> = {
			title: getRequiredString(metadata, "title") ?? undefined,
			published: getOptionalBoolean(metadata, "published"),
		};

		// Validate required fields
		if (!frontmatter.title) {
			console.warn(
				`Skipping ${filePath}: missing required frontmatter field (title)`,
			);
			return null;
		}

		return {
			slug,
			title: frontmatter.title,
			content: content.trim(),
			published: frontmatter.published ?? true,
		};
	} catch (error) {
		console.error(`Error parsing ${filePath}:`, error);
		return null;
	}
}

// Get all MDX files from a directory
function getMDXFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) {
		return [];
	}

	const files = fs.readdirSync(dir);
	return files
		.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
		.map((file) => path.join(dir, file));
}

function getSlugs(filePaths: string[]) {
	return filePaths.map((filePath) =>
		path.basename(filePath, path.extname(filePath)),
	);
}

function assertParsedAll(
	label: string,
	expectedSlugs: string[],
	parsedSlugs: string[],
) {
	if (expectedSlugs.length !== parsedSlugs.length) {
		throw new Error(
			`${label} sync aborted: parsed ${parsedSlugs.length} of ${expectedSlugs.length} files`,
		);
	}

	const parsed = new Set(parsedSlugs);
	for (const slug of expectedSlugs) {
		if (!parsed.has(slug)) {
			throw new Error(`${label} sync aborted: failed to parse ${slug}`);
		}
	}
}

function getSyncErrorMessage(error: unknown) {
	const message = error instanceof Error ? error.message : String(error);
	const redacted = contentSyncSecret
		? message.replaceAll(contentSyncSecret, "[redacted]")
		: message;

	return redacted.split("\n").at(0) ?? "Unknown error";
}

function requireConfiguration(value: string | undefined, name: string) {
	if (!value) {
		throw new Error(`${name} environment variable is not set`);
	}
	return value;
}

// Main sync function
async function syncContent() {
	if (isVerbose) {
		console.log("Starting content sync...\n");
	}

	// Get Convex URL from environment
	const convexUrl = requireConfiguration(
		process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL,
		"NEXT_PUBLIC_CONVEX_URL or CONVEX_URL",
	);
	const syncSecret = requireConfiguration(
		contentSyncSecret,
		"CONTENT_SYNC_SECRET",
	);
	const revalidation = {
		secret: requireConfiguration(revalidateSecret, "REVALIDATE_SECRET"),
		siteUrl: requireConfiguration(siteUrl, "SITE_URL"),
	};

	// Initialize Convex client
	const client = new ConvexHttpClient(convexUrl);

	// Sync blog posts
	console.log("Syncing blog posts...");
	const blogFiles = getMDXFiles(BLOG_DIR);
	const blogSlugs = getSlugs(blogFiles);

	const blogPosts: ParsedBlogPost[] = [];
	for (const filePath of blogFiles) {
		const post = parseBlogPost(filePath);
		if (post) {
			blogPosts.push(post);
			if (isVerbose) {
				console.log(`  Parsed: ${post.title} (${post.slug})`);
			}
		}
	}
	assertParsedAll(
		"Blog posts",
		blogSlugs,
		blogPosts.map((post) => post.slug),
	);

	if (blogPosts.length > 0) {
		if (isVerbose) {
			console.log(`\nSyncing ${blogPosts.length} blog posts to Convex...`);
		}
		try {
			const result = await client.mutation(api.blog.syncPostsPublic, {
				syncSecret,
				slugs: blogSlugs,
				posts: blogPosts,
			});
			console.log(
				`✓ Blog posts: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
			);
			await revalidateContentCache({ ...revalidation, tags: ["blogPosts"] });
		} catch (error) {
			console.error(`Error syncing blog posts: ${getSyncErrorMessage(error)}`);
			process.exit(1);
		}
	}

	// Sync talk events
	console.log("Syncing talk events...");
	const talkFiles = getMDXFiles(TALK_DIR);
	const talkSlugs = getSlugs(talkFiles);

	const talkEvents: ParsedTalkEvent[] = [];
	for (const filePath of talkFiles) {
		const event = parseTalkEvent(filePath);
		if (event) {
			talkEvents.push(event);
			if (isVerbose) {
				console.log(`  Parsed: ${event.title} (${event.slug})`);
			}
		}
	}
	assertParsedAll(
		"Talk events",
		talkSlugs,
		talkEvents.map((event) => event.slug),
	);

	if (talkEvents.length > 0) {
		if (isVerbose) {
			console.log(`\nSyncing ${talkEvents.length} talk events to Convex...`);
		}
		try {
			const result = await client.mutation(api.talk.syncEventsPublic, {
				syncSecret,
				slugs: talkSlugs,
				events: talkEvents,
			});
			console.log(
				`✓ Talk events: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
			);
			await revalidateContentCache({ ...revalidation, tags: ["talkEvents"] });
		} catch (error) {
			console.error(`Error syncing talk events: ${getSyncErrorMessage(error)}`);
			process.exit(1);
		}
	}

	// Sync code projects
	console.log("Syncing code projects...");
	const codeFiles = getMDXFiles(CODE_DIR);
	const codeSlugs = getSlugs(codeFiles);

	const codeProjects: ParsedCodeProject[] = [];
	for (const filePath of codeFiles) {
		const project = parseCodeProject(filePath);
		if (project) {
			codeProjects.push(project);
			if (isVerbose) {
				console.log(`  Parsed: ${project.title} (${project.slug})`);
			}
		}
	}
	assertParsedAll(
		"Code projects",
		codeSlugs,
		codeProjects.map((project) => project.slug),
	);

	if (codeProjects.length > 0) {
		if (isVerbose) {
			console.log(
				`\nSyncing ${codeProjects.length} code projects to Convex...`,
			);
		}
		try {
			const result = await client.mutation(api.code.syncProjectsPublic, {
				syncSecret,
				slugs: codeSlugs,
				projects: codeProjects,
			});
			console.log(
				`✓ Code projects: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
			);
			await revalidateContentCache({ ...revalidation, tags: ["codeProjects"] });
		} catch (error) {
			console.error(
				`Error syncing code projects: ${getSyncErrorMessage(error)}`,
			);
			process.exit(1);
		}
	}

	// Sync chat page
	console.log("Syncing chat page...");
	if (fs.existsSync(CHAT_FILE)) {
		const chatPage = parseStaticPage(CHAT_FILE, "chat");
		if (chatPage) {
			if (isVerbose) {
				console.log(`  Parsed: ${chatPage.title}`);
			}
			try {
				const result = await client.mutation(api.pages.syncPagesPublic, {
					syncSecret,
					slugs: [chatPage.slug],
					pages: [chatPage],
				});
				console.log(
					`✓ Chat page: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
				);
				await revalidateContentCache({
					...revalidation,
					tags: ["pages", "pages:chat"],
				});
			} catch (error) {
				console.error(`Error syncing chat page: ${getSyncErrorMessage(error)}`);
				process.exit(1);
			}
		}
	} else {
		if (isVerbose) {
			console.log("  Chat page file not found, skipping...");
		}
	}

	console.log("\n✓ All content sync complete!");
}

// Run the sync
syncContent().catch((error) => {
	console.error(getSyncErrorMessage(error));
	process.exit(1);
});
