import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { LikeButton } from "@/components/like-button";
import { ShareButton } from "@/components/share-button";
import { Toc } from "@/components/toc";
import { Separator } from "@/components/ui/separator";
import { getBlogPosts } from "@/lib/server-utils";
import { calculateReadingTime, formatDate } from "@/lib/utils";

export async function generateStaticParams() {
	const posts = getBlogPosts();

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
	const post = getBlogPosts().find((post) => post.slug === slug);
	if (!post) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = post.metadata;
	const ogImage = image
		? image
		: `${baseUrl}/og?title=${encodeURIComponent(title)}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			url: `${baseUrl}/blog/${post.slug}`,
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
		},
	};
}

export default async function Blog({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getBlogPosts().find((post) => post.slug === slug);

	if (!post) {
		notFound();
	}

	return (
		<section>
			<h1 className="title font-semibold text-2xl tracking-tighter">
				{post.metadata.title}
			</h1>
			<div className="flex justify-between items-center mt-2 mb-4 text-sm">
				<p className="text-sm text-muted-foreground">
					{formatDate(post.metadata.publishedAt)}
				</p>
				<p className="text-sm text-muted-foreground">
					{calculateReadingTime(post.content)}
				</p>
			</div>

			<div className="flex items-center gap-2 mb-4">
				<LikeButton postSlug={post.slug} />
				<ShareButton
					postSlug={post.slug}
					title={post.metadata.title}
					description={post.metadata.summary}
					publishedAt={formatDate(post.metadata.publishedAt)}
					author="Murad Abdulkadyrov"
				/>
			</div>

			<Separator className="mb-6" />

			<div className="relative">
				<div className="max-w-xl mx-auto">
					<article className="prose">
						<CustomMDX source={post.content} />
					</article>
				</div>
				<aside className="hidden md:block absolute top-0 left-full h-full pl-8">
					<div className="sticky top-24 w-72">
						<Toc mdxContent={post.content} />
					</div>
				</aside>
			</div>
		</section>
	);
}
