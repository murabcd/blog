import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { readContentCatalog } from "../lib/content-catalog";
import { publishContent } from "./content-publication";
import { createConvexContentPublisher } from "./convex-content-publisher";
import { revalidateContentCache } from "./revalidate-content-cache";

const isProduction = process.env.SYNC_ENV === "production";
const isVerbose =
	process.env.VERBOSE === "true" || process.argv.includes("--verbose");
const envFile = isProduction ? ".env.production.local" : ".env.local";

dotenv.config({ path: envFile, override: true });

type RequiredConfiguration =
	| "CONTENT_SYNC_SECRET"
	| "NEXT_PUBLIC_CONVEX_URL"
	| "REVALIDATE_SECRET"
	| "SITE_URL";

function requireConfiguration(name: RequiredConfiguration) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} environment variable is not set`);
	}
	return value;
}

function getErrorMessage(error: unknown) {
	let message = error instanceof Error ? error.message : String(error);
	for (const secret of [
		process.env.CONTENT_SYNC_SECRET,
		process.env.REVALIDATE_SECRET,
	]) {
		if (secret) {
			message = message.replaceAll(secret, "[redacted]");
		}
	}
	return message.split("\n").at(0) ?? "Unknown error";
}

async function main() {
	const convexUrl = requireConfiguration("NEXT_PUBLIC_CONVEX_URL");
	const siteUrl = requireConfiguration("SITE_URL");
	const syncSecret = requireConfiguration("CONTENT_SYNC_SECRET");
	const revalidateSecret = requireConfiguration("REVALIDATE_SECRET");

	if (isProduction) {
		console.log("Publishing to PRODUCTION deployment...\n");
	}
	if (isVerbose) {
		console.log(`Loaded configuration from ${envFile}`);
		console.log(`NEXT_PUBLIC_CONVEX_URL=${convexUrl}`);
		console.log(`SITE_URL=${siteUrl}\n`);
	}

	const client = new ConvexHttpClient(convexUrl);
	const catalog = readContentCatalog(process.cwd());
	const results = await publishContent(catalog, {
		publish: createConvexContentPublisher(client, syncSecret),
		invalidate: (tag) =>
			revalidateContentCache({
				secret: revalidateSecret,
				siteUrl,
				tags: [tag],
			}),
	});

	for (const result of results) {
		console.log(
			`✓ ${result.label}: ${result.created} created, ${result.updated} updated, ${result.deleted} deleted`,
		);
	}
	console.log("\n✓ All content publication complete!");
}

main().catch((error) => {
	console.error(getErrorMessage(error));
	process.exitCode = 1;
});
