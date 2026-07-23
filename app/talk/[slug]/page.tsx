import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import { formatDate } from "@/lib/utils";
import { baseUrl } from "@/lib/site";
import { CustomMDX } from "@/components/mdx";
import { serializeJsonLd } from "@/lib/jsonld";
import { getTalkEvent, getTalkEvents } from "@/lib/public-content-cache";

export async function generateStaticParams() {
	const events = await getTalkEvents();

	return events.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
	const { slug } = await params;
	const event = await getTalkEvent(slug);
	if (!event) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = event;
	const ogImage = image ? image : `${baseUrl}/talk/${slug}/opengraph-image`;
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
	const event = await getTalkEvent(slug);

	if (!event) {
		notFound();
	}

	const ogImage = event.image
		? event.image
		: `${baseUrl}/talk/${event.slug}/opengraph-image`;
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
			<Script
				id={`jsonld-talk-${event.slug}`}
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires dangerouslySetInnerHTML
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
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
