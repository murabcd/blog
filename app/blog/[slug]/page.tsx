import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import Script from "next/script";
import { api } from "@/convex/_generated/api";

import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { CopyPageButton } from "@/components/copy-page-button";
import { Toc } from "@/components/toc";
import { FloatingChatInput } from "@/components/floating-chat-input";
import { calculateReadingTime, formatDate, slugify } from "@/lib/utils";

async function getBlogPostBySlugCached(slug: string) {
	"use cache";
	cacheLife({ revalidate: 300 });
	cacheTag("blogPosts", `blogPost:${slug}`);
	return fetchQuery(api.blog.getPostBySlug, { slug });
}

function buildTocEntries(content: string) {
	const headings = content.match(/^(##|###)\s(.+)/gm);
	if (!headings) return [];
	return headings.map((heading) => {
		const level = (heading.match(/#/g) || []).length;
		const text = heading.replace(/^(##|###)\s/, "").trim();
		const slug = slugify(text);
		return { level, text, slug };
	});
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
	const { slug } = await params;
	const post = await getBlogPostBySlugCached(slug);
	if (!post) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = post;
	const ogImage = image ? image : `${baseUrl}/blog/${slug}/opengraph-image`;
	const url = `${baseUrl}/blog/${post.slug}`;

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

export default async function Blog({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getBlogPostBySlugCached(slug);

	if (!post) {
		notFound();
	}

	const ogImage = post.image
		? post.image
		: `${baseUrl}/blog/${post.slug}/opengraph-image`;
	const url = `${baseUrl}/blog/${post.slug}`;
	const tocEntries = buildTocEntries(post.content);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.summary,
		image: ogImage,
		datePublished: post.publishedAt,
		dateModified: post.publishedAt,
		author: {
			"@type": "Person",
			name: "Murad Abdulkadyrov",
		},
		publisher: {
			"@type": "Person",
			name: "Murad Abdulkadyrov",
		},
		url,
	};

	return (
		<>
			<Script
				id={`jsonld-blog-${post.slug}`}
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data requires dangerouslySetInnerHTML
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<section>
				<h1 className="title font-semibold text-2xl tracking-tighter">
					{post.title}
				</h1>
				<div className="mt-2 mb-4 text-sm">
					<p className="text-sm text-muted-foreground">
						{formatDate(post.publishedAt)} ·{" "}
						{calculateReadingTime(post.content)}
					</p>
				</div>

				<div className="flex items-center gap-2 mb-4">
					<LikeButton postSlug={post.slug} />
					<ShareButton
						postSlug={post.slug}
						title={post.title}
						description={post.summary}
						publishedAt={formatDate(post.publishedAt)}
						author="Murad Abdulkadyrov"
					/>
					<div className="ml-auto">
						<CopyPageButton slug={post.slug} url={url} />
					</div>
				</div>

				<div className="relative">
					<article className="prose max-w-xl mx-auto">
						<CustomMDX source={post.content} />
					</article>
					<Toc tocEntries={tocEntries} variant="combined" />
				</div>
			</section>
			<FloatingChatInput url={url} />
		</>
	);
}
