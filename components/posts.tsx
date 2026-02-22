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
}: {
	posts: BlogPost[];
	limit?: number;
}) {
	const sortedBlogs = [...posts].sort(
		(a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
	);
	const visibleBlogs = limit ? sortedBlogs.slice(0, limit) : sortedBlogs;

	return (
		<div className="relative">
			<div className="space-y-4">
				{visibleBlogs.map((post) => (
					<Link
						key={post.slug}
						className="block group cursor-pointer"
						href={`/blog/${post.slug}`}
					>
						<div className="flex flex-col md:flex-row gap-2">
							<p className="text-muted-foreground w-[110px] tabular-nums">
								{formatDate(post.publishedAt, false)}
							</p>
							<p className="text-foreground tracking-tight group-hover:underline">
								{post.title}
							</p>
						</div>
					</Link>
				))}
			</div>
			{limit && (
				<Link href="/blog" className="mt-8 block text-sm hover:text-primary">
					view all posts →
				</Link>
			)}
		</div>
	);
}
