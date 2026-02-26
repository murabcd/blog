"use client";

import { useEffect, useState, useRef } from "react";
import { slugify } from "@/lib/utils";
import { ChevronDown, CircleArrowUp, ChartNoAxesGantt } from "lucide-react";

interface TocEntry {
	level: number;
	text: string;
	slug: string;
}

interface TocProps {
	mdxContent?: string;
	tocEntries?: TocEntry[];
	variant?: "desktop" | "mobile" | "combined";
}

function DesktopToc({
	toc,
	activeId,
	showBackToTop,
	scrollToTop,
}: {
	toc: TocEntry[];
	activeId: string;
	showBackToTop: boolean;
	scrollToTop: () => void;
}) {
	return (
		<>
			<div className="mb-2 flex items-center gap-2">
				<ChartNoAxesGantt className="h-4 w-4" />
				<p className="tracking-tight text-sm font-medium">On this page</p>
			</div>
			<div>
				<ul className="space-y-1">
					{toc.map(({ level, text, slug }) => (
						<li
							key={slug}
							style={{ marginLeft: `${(level - 2) * 1}rem` }}
							className={`border-l pl-3 text-xs hover:text-foreground transition-colors ${
								activeId === slug
									? "border-foreground text-foreground"
									: "border-border/60 text-muted-foreground"
							}`}
						>
							<a href={`#${slug}`}>{text}</a>
						</li>
					))}
				</ul>
			</div>
			{showBackToTop && (
				<div className="mt-4">
					<button
						type="button"
						onClick={scrollToTop}
						className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 w-auto"
					>
						<CircleArrowUp className="h-3 w-3" />
						Back to top
					</button>
				</div>
			)}
		</>
	);
}

export function Toc({ mdxContent, tocEntries, variant = "desktop" }: TocProps) {
	const [toc, setToc] = useState<TocEntry[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [showMobileToc, setShowMobileToc] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const mobilePanelRef = useRef<HTMLDivElement | null>(null);
	const isMobile = variant === "mobile";
	const isDesktop = variant === "desktop";
	const isCombined = variant === "combined";

	useEffect(() => {
		if (tocEntries && tocEntries.length > 0) {
			setToc(tocEntries);
			return;
		}
		if (!mdxContent) {
			setToc([]);
			return;
		}
		const headings = mdxContent.match(/^(##|###)\s(.+)/gm);
		if (headings) {
			const parsedEntries = headings.map((heading) => {
				const level = (heading.match(/#/g) || []).length;
				const text = heading.replace(/^(##|###)\s/, "").trim();
				const slug = slugify(text);
				return { level, text, slug };
			});
			setToc(parsedEntries);
		} else {
			setToc([]);
		}
	}, [mdxContent, tocEntries]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{ rootMargin: `0% 0% -40% 0%` },
		);

		toc.forEach(({ slug }) => {
			const el = document.getElementById(slug);
			if (el) {
				observer.observe(el);
			}
		});

		return () => {
			toc.forEach(({ slug }) => {
				const el = document.getElementById(slug);
				if (el) {
					observer.unobserve(el);
				}
			});
		};
	}, [toc]);

	useEffect(() => {
		const firstHeadingId = toc[0]?.slug;
		const firstHeading = firstHeadingId
			? document.getElementById(firstHeadingId)
			: null;
		const footer = document.querySelector("footer");

		if (!firstHeading) {
			setShowMobileToc(false);
			return;
		}

		const updateMobileToc = () => {
			const shouldShow = firstHeading.getBoundingClientRect().top <= 72;
			setShowMobileToc(shouldShow);
			if (!shouldShow) {
				setMobileOpen(false);
			}
		};

		const firstHeadingObserver = new IntersectionObserver(() => {
			updateMobileToc();
		});
		firstHeadingObserver.observe(firstHeading);
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
			firstHeadingObserver.disconnect();
			if (footerObserver) {
				footerObserver.disconnect();
			}
		};
	}, [toc]);

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

	if (toc.length === 0) {
		return null;
	}

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<>
			{(isMobile || isCombined) && showMobileToc ? (
				<div className="lg:hidden fixed top-16 left-0 right-0 z-40">
					<div
						ref={mobilePanelRef}
						className="w-full rounded-none shadow-sm border-b border-border/50 bg-background dark:bg-background"
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
								<ul className="space-y-2 text-base font-normal">
									{toc.map(({ level, text, slug }) => (
										<li
											key={slug}
											style={{ marginLeft: `${(level - 2) * 0.75}rem` }}
											className={`border-l pl-3 transition-colors ${
												activeId === slug
													? "border-foreground text-foreground"
													: "border-border/60 text-muted-foreground"
											}`}
										>
											<a
												href={`#${slug}`}
												onClick={() => setMobileOpen(false)}
												className="block"
											>
												{text}
											</a>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			) : null}
			{isDesktop ? (
				<div className="sticky top-24 hidden lg:block">
					<DesktopToc
						toc={toc}
						activeId={activeId}
						showBackToTop={showBackToTop}
						scrollToTop={scrollToTop}
					/>
				</div>
			) : null}
			{isCombined ? (
				<aside className="hidden lg:block absolute top-0 left-full h-full pl-8">
					<div className="sticky top-24 w-64">
						<DesktopToc
							toc={toc}
							activeId={activeId}
							showBackToTop={showBackToTop}
							scrollToTop={scrollToTop}
						/>
					</div>
				</aside>
			) : null}
		</>
	);
}
