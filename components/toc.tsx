"use client";

import { useEffect, useState } from "react";
import { slugify } from "@/lib/utils";

interface TocEntry {
  level: number;
  text: string;
  slug: string;
}

interface TocProps {
  mdxContent: string;
}

export function Toc({ mdxContent }: TocProps) {
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const headings = mdxContent.match(/^(##|###)\s(.+)/gm);
    if (headings) {
      const tocEntries = headings.map((heading) => {
        const level = (heading.match(/#/g) || []).length;
        const text = heading.replace(/^(##|###)\s/, "").trim();
        const slug = slugify(text);
        return { level, text, slug };
      });
      setToc(tocEntries);
    }
  }, [mdxContent]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: `0% 0% -40% 0%` }
    );

    toc.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (el) {
        observer.observe(el);
      }
    });

    const handleScroll = () => {
      // A small buffer helps.
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2) {
        if (toc.length > 0) {
          setActiveId(toc[toc.length - 1].slug);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      toc.forEach(({ slug }) => {
        const el = document.getElementById(slug);
        if (el) {
          observer.unobserve(el);
        }
      });
      window.removeEventListener("scroll", handleScroll);
    };
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 hidden lg:block">
      <p className="mb-2 tracking-tight text-sm">On this post</p>
      <ul className="space-y-1">
        {toc.map(({ level, text, slug }) => (
          <li
            key={slug}
            style={{ marginLeft: `${(level - 2) * 1}rem` }}
            className={`text-xs hover:text-foreground transition-colors ${
              activeId === slug ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <a href={`#${slug}`}>{text}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
