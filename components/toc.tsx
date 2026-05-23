"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, CircleArrowUp, ChartNoAxesGantt } from "lucide-react";

export interface TocSection {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}

interface TocProps {
  sections: TocSection[];
  variant?: "desktop" | "mobile" | "combined";
}

function getSectionIds(sections: TocSection[]) {
  return sections.flatMap(({ id, children }) => [
    id,
    ...(children?.map((child) => child.id) ?? []),
  ]);
}

const headingScrollOffset = 96;

function DesktopToc({
  sections,
  activeId,
  onSelect,
  showBackToTop,
  scrollToTop,
}: {
  sections: TocSection[];
  activeId: string;
  onSelect: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  showBackToTop: boolean;
  scrollToTop: () => void;
}) {
  const activeParentId = sections.find(
    ({ id, children }) =>
      id === activeId || children?.some((child) => child.id === activeId),
  )?.id;

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <ChartNoAxesGantt className="h-4 w-4" />
        <p className="tracking-tight text-sm font-medium">On this page</p>
      </div>
      <nav aria-label="On this page" className="relative">
        <div className="absolute top-0 bottom-0 left-0 w-px bg-border/60" />
        <ul className="flex list-none flex-col gap-0 pl-0">
          {sections.map(({ id, label, children }) => {
            const expanded = activeParentId === id;
            const active = activeId === id || expanded;

            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(event) => onSelect(id, event)}
                  className={cn(
                    "block -ml-px border-l py-1 pl-4 text-xs leading-relaxed transition-colors",
                    active
                      ? "border-foreground text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                  )}
                >
                  {label}
                </a>
                {children ? (
                  <div
                    aria-hidden={!expanded}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                      expanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "pointer-events-none grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <ul className="flex min-h-0 list-none flex-col gap-0 overflow-hidden pl-0">
                      {children.map((child) => (
                        <li key={child.id}>
                          <a
                            href={`#${child.id}`}
                            onClick={(event) => onSelect(child.id, event)}
                            className={cn(
                              "block -ml-px border-l py-1 pl-8 text-xs leading-relaxed transition-colors",
                              activeId === child.id
                                ? "border-foreground text-foreground"
                                : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                            )}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
      {showBackToTop && (
        <div className="mt-4 ml-2">
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none p-0 w-auto"
          >
            <CircleArrowUp className="h-3 w-3" />
            Back to top
          </button>
        </div>
      )}
    </>
  );
}

export function Toc({ sections, variant = "desktop" }: TocProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileRevealOffset, setMobileRevealOffset] = useState(64);
  const [mobileTocSlot, setMobileTocSlot] = useState<HTMLElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const ignoreScrollActiveUpdateRef = useRef(false);
  const scrollActiveUpdateTimeoutRef = useRef<number | null>(null);
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const isCombined = variant === "combined";
  const activeParentId = sections.find(
    ({ id, children }) =>
      id === activeId || children?.some((child) => child.id === activeId),
  )?.id;

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "");
  }, [sections]);

  useEffect(() => {
    const headings = getSectionIds(sections)
      .map((id) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      return;
    }

    const updateActiveHeading = () => {
      if (ignoreScrollActiveUpdateRef.current) {
        return;
      }

      const activationOffset = headingScrollOffset + 8;
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollBottom >= documentHeight - 2) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      const activeHeading = headings.findLast(
        (heading) => heading.getBoundingClientRect().top <= activationOffset,
      );

      setActiveId(activeHeading?.id ?? headings[0].id);
    };

    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);
    updateActiveHeading();

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [sections]);

  useEffect(() => {
    const navbar = document.querySelector<HTMLElement>("[data-site-navbar]");
    const tocSlot = document.querySelector<HTMLElement>(
      "[data-mobile-toc-slot]",
    );

    setMobileTocSlot(tocSlot);

    if (!navbar) {
      setMobileRevealOffset(64);
      return;
    }

    const updateNavbarHeight = () => {
      setMobileRevealOffset(Math.round(navbar.getBoundingClientRect().height));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateNavbarHeight();
    });

    resizeObserver.observe(navbar);
    window.addEventListener("resize", updateNavbarHeight);
    updateNavbarHeight();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateNavbarHeight);
    };
  }, []);

  useEffect(() => {
    const firstHeadingId = sections[0]?.id;
    const firstHeading = firstHeadingId
      ? document.getElementById(firstHeadingId)
      : null;
    const footer = document.querySelector("footer");

    if (!firstHeading) {
      setShowMobileToc(false);
      return;
    }

    const updateMobileToc = () => {
      const shouldShow =
        firstHeading.getBoundingClientRect().top <= mobileRevealOffset;
      setShowMobileToc(shouldShow);
      if (!shouldShow) {
        setMobileOpen(false);
      }
    };

    const handleViewportChange = () => {
      updateMobileToc();
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    updateMobileToc();

    let footerObserver: IntersectionObserver | null = null;
    if (footer) {
      footerObserver = new IntersectionObserver(([entry]) => {
        setShowBackToTop(entry.isIntersecting);
      });
      footerObserver.observe(footer);
      setShowBackToTop(
        footer.getBoundingClientRect().top <= window.innerHeight,
      );
    } else {
      setShowBackToTop(false);
    }

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
      if (footerObserver) {
        footerObserver.disconnect();
      }
    };
  }, [mobileRevealOffset, sections]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (mobilePanelRef.current?.contains(target)) {
        return;
      }

      setMobileOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    return () => {
      if (scrollActiveUpdateTimeoutRef.current !== null) {
        window.clearTimeout(scrollActiveUpdateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleScrollEnd = () => {
      if (!ignoreScrollActiveUpdateRef.current) {
        return;
      }

      if (scrollActiveUpdateTimeoutRef.current !== null) {
        window.clearTimeout(scrollActiveUpdateTimeoutRef.current);
        scrollActiveUpdateTimeoutRef.current = null;
      }
      ignoreScrollActiveUpdateRef.current = false;
    };

    window.addEventListener("scrollend", handleScrollEnd);
    return () => {
      window.removeEventListener("scrollend", handleScrollEnd);
    };
  }, []);

  if (sections.length === 0) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const selectSection = (
    id: string,
    event: MouseEvent<HTMLAnchorElement>,
    options?: { closeMobile?: boolean },
  ) => {
    event.preventDefault();
    ignoreScrollActiveUpdateRef.current = true;
    if (scrollActiveUpdateTimeoutRef.current !== null) {
      window.clearTimeout(scrollActiveUpdateTimeoutRef.current);
    }

    setActiveId(id);
    window.history.pushState(null, "", `#${id}`);

    const target = document.getElementById(id);
    if (target) {
      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        headingScrollOffset;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }

    scrollActiveUpdateTimeoutRef.current = window.setTimeout(() => {
      ignoreScrollActiveUpdateRef.current = false;
      scrollActiveUpdateTimeoutRef.current = null;
    }, 3000);

    if (options?.closeMobile) {
      setMobileOpen(false);
    }
  };

  const mobileTocContent = (
    <div
      ref={mobilePanelRef}
      className="w-full rounded-none bg-background dark:bg-background"
    >
      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 pl-4 pr-5.5 py-3 text-base font-normal"
      >
        <span className="flex items-center gap-2">
          <ChartNoAxesGantt className="h-4 w-4" />
          On this page
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            mobileOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4">
          <ul className="flex list-none flex-col gap-0 pl-0 text-base font-normal">
            {sections.map(({ id, label, children }) => {
              const expanded = activeParentId === id;
              const active = activeId === id || expanded;

              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(event) =>
                      selectSection(id, event, { closeMobile: true })
                    }
                    className={cn(
                      "block -ml-px border-l py-1.5 pl-3 transition-colors",
                      active
                        ? "border-foreground text-foreground"
                        : "border-border/60 text-muted-foreground",
                    )}
                  >
                    {label}
                  </a>
                  {children ? (
                    <div
                      aria-hidden={!expanded}
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                        expanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "pointer-events-none grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <ul className="flex min-h-0 list-none flex-col gap-0 overflow-hidden pl-0">
                        {children.map((child) => (
                          <li key={child.id}>
                            <a
                              href={`#${child.id}`}
                              onClick={(event) =>
                                selectSection(child.id, event, {
                                  closeMobile: true,
                                })
                              }
                              className={cn(
                                "block -ml-px border-l py-1.5 pl-7 transition-colors",
                                activeId === child.id
                                  ? "border-foreground text-foreground"
                                  : "border-border/60 text-muted-foreground",
                              )}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {(isMobile || isCombined) && showMobileToc ? (
        mobileTocSlot ? (
          createPortal(mobileTocContent, mobileTocSlot)
        ) : (
          <div className="lg:hidden">{mobileTocContent}</div>
        )
      ) : null}
      {isDesktop ? (
        <div className="sticky top-24 hidden lg:block">
          <DesktopToc
            sections={sections}
            activeId={activeId}
            onSelect={selectSection}
            showBackToTop={showBackToTop}
            scrollToTop={scrollToTop}
          />
        </div>
      ) : null}
      {isCombined ? (
        <aside className="hidden lg:block absolute top-0 left-full h-full pl-8">
          <div className="sticky top-24 w-64">
            <DesktopToc
              sections={sections}
              activeId={activeId}
              onSelect={selectSection}
              showBackToTop={showBackToTop}
              scrollToTop={scrollToTop}
            />
          </div>
        </aside>
      ) : null}
    </>
  );
}
