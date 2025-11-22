import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/utils";
import { getTalksEvents } from "@/lib/server-utils";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";

export async function generateStaticParams() {
	const events = getTalksEvents();

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
	const event = getTalksEvents().find((event) => event.slug === slug);
	if (!event) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = event.metadata;
	const ogImage = image
		? image
		: `${baseUrl}/og?title=${encodeURIComponent(title)}`;
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
	const event = getTalksEvents().find((event) => event.slug === slug);

	if (!event) {
		notFound();
	}

	const ogImage = event.metadata.image
		? event.metadata.image
		: `${baseUrl}/og?title=${encodeURIComponent(event.metadata.title)}`;
	const url = `${baseUrl}/talk/${event.slug}`;

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Event",
		name: event.metadata.title,
		description: event.metadata.summary,
		image: ogImage,
		startDate: event.metadata.publishedAt,
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
					{event.metadata.title}
				</h1>
				<div className="flex justify-between items-center mt-2 mb-8 text-sm">
					<p className="text-sm text-muted-foreground">
						{formatDate(event.metadata.publishedAt)}{" "}
					</p>
				</div>
				<article className="prose">
					<CustomMDX source={event.content} />
				</article>
			</section>
		</>
	);
}
