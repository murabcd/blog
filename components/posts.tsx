import Link from "next/link";
import { formatDate } from "@/lib/utils";

type BlogPost = {
	slug: string;
	title: string;
	publishedAt: string;
};

export function BlogPosts({
	posts,
	limit,
	titleElement: TitleElement,
}: {
	posts: BlogPost[];
	limit?: number;
	titleElement: "h2" | "h3";
}) {
	const sortedBlogs = posts.toSorted(
		(a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
	);
	const visibleBlogs = limit ? sortedBlogs.slice(0, limit) : sortedBlogs;

	return (
		<div className="relative">
			<div className="space-y-4">
				{visibleBlogs.map((post) => (
					<Link
						key={post.slug}
						className="block group"
						href={`/blog/${post.slug}`}
						prefetch={true}
					>
						<div className="flex flex-col md:flex-row gap-2">
							<p className="text-muted-foreground w-[110px] tabular-nums">
								{formatDate(post.publishedAt, false)}
							</p>
							<TitleElement className="text-foreground tracking-tight group-hover:underline">
								{post.title}
							</TitleElement>
						</div>
					</Link>
				))}
			</div>
			{limit !== undefined ? (
				<Link href="/blog" className="mt-8 block text-sm hover:text-primary">
					view all posts →
				</Link>
			) : null}
		</div>
	);
}
