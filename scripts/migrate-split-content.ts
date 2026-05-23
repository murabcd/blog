import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
import { api } from "../convex/_generated/api";

const isProduction = process.env.SYNC_ENV === "production";
const envFile = isProduction ? ".env.production.local" : ".env.local";

dotenv.config({ path: envFile, override: true });

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
const syncSecret = process.env.CONTENT_SYNC_SECRET;

if (!convexUrl) {
	throw new Error(`Missing NEXT_PUBLIC_CONVEX_URL or CONVEX_URL in ${envFile}`);
}

if (!syncSecret) {
	throw new Error(`Missing CONTENT_SYNC_SECRET in ${envFile}`);
}

const client = new ConvexHttpClient(convexUrl);
const result = await client.mutation(api.migrations.migrateSplitContentPublic, {
	syncSecret,
});

console.log(
	`Migrated ${result.migrated} content documents and cleaned ${result.cleaned} legacy fields.`,
);
