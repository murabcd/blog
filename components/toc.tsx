"use client";

import { useEffect, useState, useRef } from "react";
import { slugify } from "@/lib/utils";
import {
	ChevronDown,
	CircleArrowUp,
	ChartNoAxesGantt,
	List,
} from "lucide-react";

interface TocEntry {
	level: number;
	text: string;
	slug: string;
}

interface TocProps {
	mdxContent: string;
	variant?: "desktop" | "mobile";
}

export function Toc({ mdxContent, variant = "desktop" }: TocProps) {
	const [toc, setToc] = useState<TocEntry[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [showMobileToc, setShowMobileToc] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const mobilePanelRef = useRef<HTMLDivElement | null>(null);

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
		const doc = rootRef.current?.ownerDocument ?? document;
		const win = doc.defaultView ?? window;
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
			const el = doc.getElementById(slug);
			if (el) {
				observer.observe(el);
			}
		});

		const handleScroll = () => {
			// A small buffer helps.
			if (win.innerHeight + win.scrollY >= doc.body.offsetHeight - 2) {
				if (toc.length > 0) {
					setActiveId(toc[toc.length - 1].slug);
				}
				setShowBackToTop(true);
			} else {
				setShowBackToTop(false);
			}

			const firstHeadingId = toc[0]?.slug;
			const firstHeading = firstHeadingId
				? doc.getElementById(firstHeadingId)
				: null;

			if (firstHeading) {
				const shouldShow = firstHeading.getBoundingClientRect().top <= 72;
				setShowMobileToc(shouldShow);
				if (!shouldShow) {
					setMobileOpen(false);
				}
			} else {
				setShowMobileToc(false);
			}
		};

		win.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();

		return () => {
			toc.forEach(({ slug }) => {
				const el = doc.getElementById(slug);
				if (el) {
					observer.unobserve(el);
				}
			});
			win.removeEventListener("scroll", handleScroll);
		};
	}, [toc]);

	useEffect(() => {
		if (!mobileOpen) {
			return;
		}

		const doc = rootRef.current?.ownerDocument ?? document;
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

		doc.addEventListener("pointerdown", handlePointerDown);
		return () => {
			doc.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [mobileOpen]);

	if (toc.length === 0) {
		return null;
	}

	const scrollToTop = () => {
		const win = rootRef.current?.ownerDocument?.defaultView ?? window;
		win.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (variant === "mobile") {
		if (!showMobileToc) {
			return null;
		}

		return (
			<div ref={rootRef} className="lg:hidden fixed top-18 left-0 right-0 z-40">
				<div
					ref={mobilePanelRef}
					className="mx-4 max-w-xl md:mx-auto rounded-lg bg-background/70 dark:bg-background/60 shadow-sm backdrop-blur-sm"
				>
					<button
						type="button"
						onClick={() => setMobileOpen((prev) => !prev)}
						className="w-full flex items-center justify-between gap-3 px-4 py-3 text-base font-normal"
					>
						<span className="flex items-center gap-2">
							<List className="h-4 w-4" />
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
		);
	}

	return (
		<div ref={rootRef} className="sticky top-24 hidden lg:block">
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
		</div>
	);
}
