import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { CopyPageButton } from "@/components/copy-page-button";
import { Toc } from "@/components/toc";
import { calculateReadingTime, formatDate } from "@/lib/utils";

export async function generateStaticParams() {
	const posts = await fetchQuery(api.blog.getAllPosts);

	return posts.map((post) => ({
		slug: post.slug,
	}));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
	const { slug } = await params;
	const post = await fetchQuery(api.blog.getPostBySlug, { slug });
	if (!post) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = post;
	const ogImage = image
		? image
		: `${baseUrl}/api/og?title=${encodeURIComponent(title)}`;
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
			images: [ogImage],
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
	const post = await fetchQuery(api.blog.getPostBySlug, { slug });

	if (!post) {
		notFound();
	}

	const ogImage = post.image
		? post.image
		: `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}`;
	const url = `${baseUrl}/blog/${post.slug}`;

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
			<script
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
						<CopyPageButton page={post.content} url={url} />
					</div>
				</div>

				<div className="relative">
					<article className="prose max-w-xl mx-auto">
						<CustomMDX source={post.content} />
					</article>
					<aside className="hidden lg:block absolute top-0 left-full h-full pl-8">
						<div className="sticky top-24 w-64">
							<Toc mdxContent={post.content} />
						</div>
					</aside>
				</div>
			</section>
		</>
	);
}
