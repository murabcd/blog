import { Metadata } from "next";
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
  const ogImage = image ? image : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/talk/${event.slug}`,
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

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: event.metadata.title,
            datePublished: event.metadata.publishedAt,
            dateModified: event.metadata.publishedAt,
            description: event.metadata.summary,
            image: event.metadata.image
              ? `${baseUrl}${event.metadata.image}`
              : `/og?title=${encodeURIComponent(event.metadata.title)}`,
            url: `${baseUrl}/talk/${event.slug}`,
            author: {
              "@type": "Person",
              name: "Murad Abdulkadyrov",
            },
          }),
        }}
      />
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
  );
}
