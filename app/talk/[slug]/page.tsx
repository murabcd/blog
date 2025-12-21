import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { unstable_cache } from "next/cache";
import { api } from "@/convex/_generated/api";

import { formatDate } from "@/lib/utils";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";

const getAllTalkEventsCached = unstable_cache(
	async () => {
		return fetchQuery(api.talk.getAllEvents);
	},
	["convex", "talk", "getAllEvents"],
	{
		tags: ["talkEvents"],
		revalidate: 60,
	},
);

const getTalkEventBySlugCached = unstable_cache(
	async (slug: string) => {
		return fetchQuery(api.talk.getEventBySlug, { slug });
	},
	["convex", "talk", "getEventBySlug"],
	{
		tags: ["talkEvents"],
		revalidate: 300,
	},
);

export async function generateStaticParams() {
	const events = await getAllTalkEventsCached();

	return events.map((event) => ({
		slug: event.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
	const { slug } = await params;
	const event = await getTalkEventBySlugCached(slug);
	if (!event) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = event;
	const ogImage = image
		? image
		: `${baseUrl}/api/og?title=${encodeURIComponent(title)}`;
	const url = `${baseUrl}/talk/${event.slug}`;

	return {
		title,
		description,
		authors: [{ name: "Murad Abdulkadyrov" }],
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			modifiedTime: publishedTime,
			url,
			siteName: "Murad Abdulkadyrov",
			locale: "en_US",
			authors: ["Murad Abdulkadyrov"],
			images: [
				{
					url: ogImage,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
			creator: "@murabcd",
		},
		alternates: {
			canonical: url,
		},
	};
}

export default async function EventPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const event = await getTalkEventBySlugCached(slug);

	if (!event) {
		notFound();
	}

	const ogImage = event.image
		? event.image
		: `${baseUrl}/api/og?title=${encodeURIComponent(event.title)}`;
	const url = `${baseUrl}/talk/${event.slug}`;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Event",
		name: event.title,
		description: event.summary,
		image: ogImage,
		startDate: event.publishedAt,
		organizer: {
			"@type": "Person",
			name: "Murad Abdulkadyrov",
		},
		url,
	};

	return (
		<>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires dangerouslySetInnerHTML
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<section>
				<h1 className="title font-semibold text-2xl tracking-tighter">
					{event.title}
				</h1>
				<div className="flex justify-between items-center mt-2 mb-8 text-sm">
					<p className="text-sm text-muted-foreground">
						{formatDate(event.publishedAt)}{" "}
					</p>
				</div>
				<article className="prose">
					<CustomMDX source={event.content} />
				</article>
			</section>
		</>
	);
}
