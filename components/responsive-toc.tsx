"use client";

import { type MouseEvent, type RefObject, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChartNoAxesGantt, ChevronDown } from "lucide-react";
import { CompactToc } from "@/components/compact-toc";
import type { TocSection } from "@/components/toc";
import { cn } from "@/lib/utils";

function subscribeToMobileTocSlot() {
	return () => {};
}

function getMobileTocSlotSnapshot() {
	return document.querySelector<HTMLElement>("[data-mobile-toc-slot]");
}

function getServerMobileTocSlotSnapshot() {
	return null;
}

export function ResponsiveToc({
	sections,
	activeId,
	mobileOpen,
	showMobileToc,
	panelRef,
	onToggle,
	onSelect,
	onReveal,
}: {
	sections: TocSection[];
	activeId: string;
	mobileOpen: boolean;
	showMobileToc: boolean;
	panelRef: RefObject<HTMLDivElement | null>;
	onToggle: () => void;
	onSelect: (
		id: string,
		event: MouseEvent<HTMLAnchorElement>,
		options?: { closeMobile?: boolean },
	) => void;
	onReveal: (id: string, behavior: ScrollBehavior) => void;
}) {
	const mobileTocSlot = useSyncExternalStore(
		subscribeToMobileTocSlot,
		getMobileTocSlotSnapshot,
		getServerMobileTocSlotSnapshot,
	);
	const activeParentId = sections.find(
		({ id, children }) =>
			id === activeId || children?.some((child) => child.id === activeId),
	)?.id;
	const mobileContent = (
		<MobileToc
			sections={sections}
			activeId={activeId}
			activeParentId={activeParentId}
			mobileOpen={mobileOpen}
			panelRef={panelRef}
			onToggle={onToggle}
			onSelect={onSelect}
		/>
	);

	return (
		<>
			{showMobileToc ? (
				mobileTocSlot ? (
					createPortal(mobileContent, mobileTocSlot)
				) : (
					<div className="md:hidden">{mobileContent}</div>
				)
			) : null}
			<div className="absolute top-0 left-full z-40 hidden h-full pl-8 md:block xl:hidden">
				<div className="sticky top-1/2 -translate-y-1/2">
					<CompactToc
						sections={sections}
						activeId={activeId}
						onReveal={onReveal}
					/>
				</div>
			</div>
		</>
	);
}

function MobileToc({
	sections,
	activeId,
	activeParentId,
	mobileOpen,
	panelRef,
	onToggle,
	onSelect,
}: {
	sections: TocSection[];
	activeId: string;
	activeParentId: string | undefined;
	mobileOpen: boolean;
	panelRef: React.RefObject<HTMLDivElement | null>;
	onToggle: () => void;
	onSelect: (
		id: string,
		event: MouseEvent<HTMLAnchorElement>,
		options?: { closeMobile?: boolean },
	) => void;
}) {
	return (
		<div
			ref={panelRef}
			className="w-full rounded-none bg-background dark:bg-background"
		>
			<button
				type="button"
				onClick={onToggle}
				className="w-full flex items-center justify-between gap-3 pr-1.5 py-3 text-base font-normal"
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
				<div className="pb-4">
					<ul className="flex list-none flex-col gap-0 pl-0 text-base font-normal">
						{sections.map(({ id, label, children }) => {
							const expanded = activeParentId === id;
							const active = activeId === id || expanded;

							return (
								<li key={id}>
									<a
										href={`#${id}`}
										onClick={(event) =>
											onSelect(id, event, { closeMobile: true })
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
																onSelect(child.id, event, {
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
}
