import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { getBlogPosts } from "@/lib/server-utils";

export function BlogPosts({ limit }: { limit?: number }) {
	let allBlogs = getBlogPosts();

	allBlogs = allBlogs.sort((a, b) => {
		if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
			return -1;
		}
		return 1;
	});

	if (limit) {
		allBlogs = allBlogs.slice(0, limit);
	}

	return (
		<div className="relative">
			<div className="space-y-4">
				{allBlogs.map((post) => (
					<Link
						key={post.slug}
						className="block group cursor-pointer"
						href={`/blog/${post.slug}`}
					>
						<div className="flex flex-col md:flex-row gap-2">
							<p className="text-muted-foreground w-[110px] tabular-nums">
								{formatDate(post.metadata.publishedAt, false)}
							</p>
							<p className="text-foreground tracking-tight group-hover:underline">
								{post.metadata.title}
							</p>
						</div>
					</Link>
				))}
			</div>
			{limit && (
				<Link href="/blog" className="mt-8 block hover:text-primary">
					view all posts →
				</Link>
			)}
		</div>
	);
}
