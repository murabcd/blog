import { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatDate, calculateReadingTime } from "@/lib/utils";
import { getBlogPosts } from "@/lib/server-utils";

import { baseUrl } from "@/app/sitemap";

import { CustomMDX } from "@/components/mdx";
import { Toc } from "@/components/toc";

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
  const ogImage = image ? image : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

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

export default async function Blog({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: "Murad Abdulkadyrov",
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <p className="text-sm text-muted-foreground">
          {formatDate(post.metadata.publishedAt)}
        </p>
        <p className="text-sm text-muted-foreground">
          {calculateReadingTime(post.content)}
        </p>
      </div>

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
