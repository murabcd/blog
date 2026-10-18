"use client";

import type { MouseEvent } from "react";
import { useEffect, useReducer, useRef } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ChartNoAxesGantt } from "lucide-react";
import { ResponsiveToc } from "@/components/responsive-toc";

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

interface TocState {
	activeId: string;
	showBackToTop: boolean;
	showMobileToc: boolean;
	mobileOpen: boolean;
}

type TocAction =
	| { type: "setActiveId"; activeId: string }
	| { type: "setShowBackToTop"; showBackToTop: boolean }
	| { type: "setShowMobileToc"; showMobileToc: boolean }
	| { type: "setMobileOpen"; mobileOpen: boolean }
	| { type: "toggleMobileOpen" };

function tocReducer(state: TocState, action: TocAction): TocState {
	switch (action.type) {
		case "setActiveId":
			return state.activeId === action.activeId
				? state
				: { ...state, activeId: action.activeId };
		case "setShowBackToTop":
			return state.showBackToTop === action.showBackToTop
				? state
				: { ...state, showBackToTop: action.showBackToTop };
		case "setShowMobileToc":
			return state.showMobileToc === action.showMobileToc
				? state
				: {
						...state,
						showMobileToc: action.showMobileToc,
						mobileOpen: action.showMobileToc ? state.mobileOpen : false,
					};
		case "setMobileOpen":
			return state.mobileOpen === action.mobileOpen
				? state
				: { ...state, mobileOpen: action.mobileOpen };
		case "toggleMobileOpen":
			return { ...state, mobileOpen: !state.mobileOpen };
	}
}

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
}

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
						<ArrowUp className="h-3 w-3" />
						Back to top
					</button>
				</div>
			)}
		</>
	);
}

export function Toc({ sections, variant = "desktop" }: TocProps) {
	const sectionsRef = useRef(sections);
	const stableSections = sectionsRef.current;
	const [state, dispatch] = useReducer(tocReducer, stableSections, (items) => ({
		activeId: items[0]?.id ?? "",
		showBackToTop: false,
		showMobileToc: false,
		mobileOpen: false,
	}));
	const mobileRevealOffsetRef = useRef(64);
	const mobilePanelRef = useRef<HTMLDivElement | null>(null);
	const ignoreScrollActiveUpdateRef = useRef(false);
	const scrollActiveUpdateTimeoutRef = useRef<number | null>(null);
	const isMobile = variant === "mobile";
	const isDesktop = variant === "desktop";
	const isCombined = variant === "combined";

	useEffect(() => {
		const headings = getSectionIds(stableSections)
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
				dispatch({
					type: "setActiveId",
					activeId: headings[headings.length - 1].id,
				});
				return;
			}

			const activeHeading = headings.findLast(
				(heading) => heading.getBoundingClientRect().top <= activationOffset,
			);

			dispatch({
				type: "setActiveId",
				activeId: activeHeading?.id ?? headings[0].id,
			});
		};

		window.addEventListener("scroll", updateActiveHeading, { passive: true });
		window.addEventListener("resize", updateActiveHeading);
		updateActiveHeading();

		return () => {
			window.removeEventListener("scroll", updateActiveHeading);
			window.removeEventListener("resize", updateActiveHeading);
		};
	}, [stableSections]);

	useEffect(() => {
		const navbar = document.querySelector<HTMLElement>("[data-site-navbar]");

		if (!navbar) {
			mobileRevealOffsetRef.current = 64;
			return;
		}

		const updateNavbarHeight = () => {
			mobileRevealOffsetRef.current = Math.round(
				navbar.getBoundingClientRect().height,
			);
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
		const firstHeadingId = stableSections[0]?.id;
		const firstHeading = firstHeadingId
			? document.getElementById(firstHeadingId)
			: null;
		const footer = document.querySelector("footer");

		if (!firstHeading) {
			dispatch({ type: "setShowMobileToc", showMobileToc: false });
			return;
		}

		const updateMobileToc = () => {
			const shouldShow =
				firstHeading.getBoundingClientRect().top <=
				mobileRevealOffsetRef.current;
			dispatch({ type: "setShowMobileToc", showMobileToc: shouldShow });
		};

		const handleViewportChange = () => {
			updateMobileToc();
		};

		window.addEventListener("scroll", handleViewportChange, { passive: true });
		window.addEventListener("resize", handleViewportChange);
		updateMobileToc();

		const footerObserver = new IntersectionObserver(([entry]) => {
			dispatch({
				type: "setShowBackToTop",
				showBackToTop: entry.isIntersecting,
			});
		});
		if (footer) {
			footerObserver.observe(footer);
			dispatch({
				type: "setShowBackToTop",
				showBackToTop: footer.getBoundingClientRect().top <= window.innerHeight,
			});
		} else {
			dispatch({ type: "setShowBackToTop", showBackToTop: false });
		}

		return () => {
			window.removeEventListener("scroll", handleViewportChange);
			window.removeEventListener("resize", handleViewportChange);
			footerObserver.disconnect();
		};
	}, [stableSections]);

	useEffect(() => {
		if (!state.mobileOpen) {
			return;
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (!(event.target instanceof Node)) {
				return;
			}

			if (mobilePanelRef.current?.contains(event.target)) {
				return;
			}

			dispatch({ type: "setMobileOpen", mobileOpen: false });
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [state.mobileOpen]);

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

	if (stableSections.length === 0) {
		return null;
	}

	const revealSection = (id: string, behavior: ScrollBehavior) => {
		ignoreScrollActiveUpdateRef.current = true;
		if (scrollActiveUpdateTimeoutRef.current !== null) {
			window.clearTimeout(scrollActiveUpdateTimeoutRef.current);
		}

		dispatch({ type: "setActiveId", activeId: id });
		if (window.location.hash !== `#${id}`) {
			if (behavior === "auto") {
				window.history.replaceState(null, "", `#${id}`);
			} else {
				window.history.pushState(null, "", `#${id}`);
			}
		}

		const target = document.getElementById(id);
		if (target) {
			const top =
				target.getBoundingClientRect().top +
				window.scrollY -
				headingScrollOffset;
			window.scrollTo({
				top,
				// Scrubbing must bypass the page's CSS smooth scrolling.
				behavior:
					behavior === "auto" ||
					window.matchMedia("(prefers-reduced-motion: reduce)").matches
						? "instant"
						: behavior,
			});
		}

		scrollActiveUpdateTimeoutRef.current = window.setTimeout(() => {
			ignoreScrollActiveUpdateRef.current = false;
			scrollActiveUpdateTimeoutRef.current = null;
		}, 3000);
	};

	const selectSection = (
		id: string,
		event: MouseEvent<HTMLAnchorElement>,
		options?: { closeMobile?: boolean },
	) => {
		event.preventDefault();
		revealSection(id, "smooth");

		if (options?.closeMobile) {
			dispatch({ type: "setMobileOpen", mobileOpen: false });
		}
	};

	return (
		<>
			{isMobile || isCombined ? (
				<ResponsiveToc
					sections={stableSections}
					activeId={state.activeId}
					mobileOpen={state.mobileOpen}
					showMobileToc={state.showMobileToc}
					panelRef={mobilePanelRef}
					onToggle={() => dispatch({ type: "toggleMobileOpen" })}
					onSelect={selectSection}
					onReveal={revealSection}
				/>
			) : null}
			{isDesktop ? (
				<div className="sticky top-24 hidden xl:block">
					<DesktopToc
						sections={stableSections}
						activeId={state.activeId}
						onSelect={selectSection}
						showBackToTop={state.showBackToTop}
						scrollToTop={scrollToTop}
					/>
				</div>
			) : null}
			{isCombined ? (
				<aside className="hidden xl:block absolute top-0 left-full h-full pl-8">
					<div className="sticky top-24 w-64">
						<DesktopToc
							sections={stableSections}
							activeId={state.activeId}
							onSelect={selectSection}
							showBackToTop={state.showBackToTop}
							scrollToTop={scrollToTop}
						/>
					</div>
				</aside>
			) : null}
		</>
	);
}
