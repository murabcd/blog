import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import dotenv from "dotenv";

// Load environment variables based on SYNC_ENV
const isProduction = process.env.SYNC_ENV === "production";
const isVerbose =
	process.env.VERBOSE === "true" || process.argv.includes("--verbose");

const envFile = isProduction ? ".env.production.local" : ".env.local";
dotenv.config({ path: envFile, override: true });

const revalidateSecret = process.env.REVALIDATE_SECRET;
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
	metadata: BlogPostFrontmatter | TalkEventFrontmatter;
	content: string;
} | null {
	try {
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const { data, content } = matter(fileContent);
		return {
			metadata: data as BlogPostFrontmatter | TalkEventFrontmatter,
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

	const frontmatter = parsed.metadata as BlogPostFrontmatter;

	// Validate required fields
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

	const frontmatter = parsed.metadata as TalkEventFrontmatter;

	// Validate required fields
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

		const frontmatter = data as Partial<CodeProjectFrontmatter>;

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

		const frontmatter = data as Partial<StaticPageFrontmatter>;

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

async function revalidateTags(tags: string[]) {
	if (!siteUrl || !revalidateSecret || tags.length === 0) return;

	try {
		const response = await fetch(`${siteUrl}/api/revalidate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-revalidate-secret": revalidateSecret,
			},
			body: JSON.stringify({ tags }),
		});

		if (!response.ok) {
			console.warn(
				`Revalidate failed (${response.status}): ${await response.text()}`,
			);
		}
	} catch (error) {
		console.warn("Revalidate request failed:", error);
	}
}

// Main sync function
async function syncContent() {
	if (isVerbose) {
		console.log("Starting content sync...\n");
	}

	// Get Convex URL from environment
	const convexUrl =
		process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
	if (!convexUrl) {
		console.error(
			"Error: NEXT_PUBLIC_CONVEX_URL or CONVEX_URL environment variable is not set",
		);
		process.exit(1);
	}

	// Initialize Convex client
	const client = new ConvexHttpClient(convexUrl);

	// Sync blog posts
	console.log("Syncing blog posts...");
	const blogFiles = getMDXFiles(BLOG_DIR);

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

	if (blogPosts.length > 0) {
		if (isVerbose) {
			console.log(`\nSyncing ${blogPosts.length} blog posts to Convex...`);
		}
		try {
			const result = await client.mutation(api.blog.syncPostsPublic, {
				posts: blogPosts,
			});
			console.log(
				`✓ Blog posts: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
			);
			await revalidateTags(["blogPosts"]);
		} catch (error) {
			console.error("Error syncing blog posts:", error);
			process.exit(1);
		}
	}

	// Sync talk events
	console.log("Syncing talk events...");
	const talkFiles = getMDXFiles(TALK_DIR);

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

	if (talkEvents.length > 0) {
		if (isVerbose) {
			console.log(`\nSyncing ${talkEvents.length} talk events to Convex...`);
		}
		try {
			const result = await client.mutation(api.talk.syncEventsPublic, {
				events: talkEvents,
			});
			console.log(
				`✓ Talk events: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
			);
			await revalidateTags(["talkEvents"]);
		} catch (error) {
			console.error("Error syncing talk events:", error);
			process.exit(1);
		}
	}

	// Sync code projects
	console.log("Syncing code projects...");
	const codeFiles = getMDXFiles(CODE_DIR);

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

	if (codeProjects.length > 0) {
		if (isVerbose) {
			console.log(
				`\nSyncing ${codeProjects.length} code projects to Convex...`,
			);
		}
		try {
			const result = await client.mutation(api.code.syncProjectsPublic, {
				projects: codeProjects,
			});
			console.log(
				`✓ Code projects: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
			);
			await revalidateTags(["codeProjects"]);
		} catch (error) {
			console.error("Error syncing code projects:", error);
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
					pages: [chatPage],
				});
				console.log(
					`✓ Chat page: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
				);
				await revalidateTags(["pages", "pages:chat"]);
			} catch (error) {
				console.error("Error syncing chat page:", error);
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
syncContent().catch(console.error);
