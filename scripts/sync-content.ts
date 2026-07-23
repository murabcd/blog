import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { api } from "../convex/_generated/api";
import { readContentCatalog } from "../lib/content-catalog";
import { revalidateContentCache } from "./revalidate-content-cache";

const isProduction = process.env.SYNC_ENV === "production";
const isVerbose =
	process.env.VERBOSE === "true" || process.argv.includes("--verbose");
const envFile = isProduction ? ".env.production.local" : ".env.local";

dotenv.config({ path: envFile, override: true });

const contentSyncSecret = process.env.CONTENT_SYNC_SECRET;
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

async function syncContent() {
	if (isVerbose) {
		console.log("Starting content sync...\n");
	}

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
	const client = new ConvexHttpClient(convexUrl);
	const catalog = readContentCatalog(process.cwd());

	console.log("Syncing blog posts...");
	try {
		const result = await client.mutation(api.blog.syncPostsPublic, {
			syncSecret,
			slugs: catalog.blogPosts.map((post) => post.slug),
			posts: catalog.blogPosts,
		});
		console.log(
			`✓ Blog posts: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
		);
		await revalidateContentCache({ ...revalidation, tags: ["blogPosts"] });
	} catch (error) {
		console.error(`Error syncing blog posts: ${getSyncErrorMessage(error)}`);
		process.exit(1);
	}

	console.log("Syncing talk events...");
	try {
		const result = await client.mutation(api.talk.syncEventsPublic, {
			syncSecret,
			slugs: catalog.talkEvents.map((event) => event.slug),
			events: catalog.talkEvents,
		});
		console.log(
			`✓ Talk events: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
		);
		await revalidateContentCache({ ...revalidation, tags: ["talkEvents"] });
	} catch (error) {
		console.error(`Error syncing talk events: ${getSyncErrorMessage(error)}`);
		process.exit(1);
	}

	console.log("Syncing code projects...");
	try {
		const result = await client.mutation(api.code.syncProjectsPublic, {
			syncSecret,
			slugs: catalog.codeProjects.map((project) => project.slug),
			projects: catalog.codeProjects,
		});
		console.log(
			`✓ Code projects: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
		);
		await revalidateContentCache({ ...revalidation, tags: ["codeProjects"] });
	} catch (error) {
		console.error(`Error syncing code projects: ${getSyncErrorMessage(error)}`);
		process.exit(1);
	}

	console.log("Syncing static pages...");
	try {
		const result = await client.mutation(api.pages.syncPagesPublic, {
			syncSecret,
			slugs: catalog.staticPages.map((page) => page.slug),
			pages: catalog.staticPages,
		});
		console.log(
			`✓ Static pages: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
		);
		await revalidateContentCache({
			...revalidation,
			tags: ["pages", "pages:chat"],
		});
	} catch (error) {
		console.error(`Error syncing static pages: ${getSyncErrorMessage(error)}`);
		process.exit(1);
	}

	console.log("\n✓ All content sync complete!");
}

syncContent().catch((error) => {
	console.error(getSyncErrorMessage(error));
	process.exit(1);
});
