"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { createPortal } from "react-dom";

export type CompactNavigationRailItem = {
	ariaLabel: string;
	id: string;
};

type CompactNavigationRailProps<TItem extends CompactNavigationRailItem> = {
	activeIndex: number;
	ariaLabel: string;
	items: TItem[];
	onReveal: (item: TItem, behavior: ScrollBehavior) => void;
	renderPreview: (item: TItem) => React.ReactNode;
};

const MAX_MARKER_DISTANCE = 3;
const COMPACT_MARKER_WIDTH_CLASS = "w-[7px]";
const PREVIEW_OFFSET = 8;

const getMarkerWidthClass = (distance: number) => {
	if (distance === 0) {
		return "w-[30px]";
	}

	if (distance === 1) {
		return "w-[24px]";
	}

	if (distance === 2) {
		return "w-[18px]";
	}

	if (distance === 3) {
		return "w-[12px]";
	}

	return COMPACT_MARKER_WIDTH_CLASS;
};

const escapeSelectorValue = (value: string) =>
	typeof CSS !== "undefined" && typeof CSS.escape === "function"
		? CSS.escape(value)
		: value.replace(/"/g, '\\"');

export function CompactNavigationRail<TItem extends CompactNavigationRailItem>({
	activeIndex,
	ariaLabel,
	items,
	onReveal,
	renderPreview,
}: CompactNavigationRailProps<TItem>) {
	const railInstanceId = React.useId();
	const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
	const [scrubbedItemId, setScrubbedItemId] = React.useState<string | null>(
		null,
	);
	const scrubPointerRef = React.useRef<{
		pointerId: number;
		target: HTMLElement;
	} | null>(null);
	const scrubMovedRef = React.useRef(false);

	const selectedItemId = scrubbedItemId ?? hoveredItemId;
	const selectedItem =
		(selectedItemId
			? items.find((item) => item.id === selectedItemId)
			: null) ?? null;

	const getItemFromPointerEvent = (
		event: React.PointerEvent<HTMLElement>,
	): TItem | null => {
		const railRect = event.currentTarget.getBoundingClientRect();
		const target = document.elementFromPoint(
			railRect.left + railRect.width / 2,
			Math.max(railRect.top, Math.min(event.clientY, railRect.bottom - 1)),
		);
		const itemElement = target?.closest<HTMLElement>(
			"[data-compact-navigation-rail-item-id]",
		);
		const itemId = itemElement?.dataset.compactNavigationRailItemId;

		return itemId ? (items.find((item) => item.id === itemId) ?? null) : null;
	};

	const stopScrubbing = (event: React.PointerEvent<HTMLElement>) => {
		const scrubPointer = scrubPointerRef.current;

		if (scrubPointer?.pointerId !== event.pointerId) {
			return;
		}

		if (scrubPointer.target.hasPointerCapture(event.pointerId)) {
			scrubPointer.target.releasePointerCapture(event.pointerId);
		}
		scrubPointerRef.current = null;
		setScrubbedItemId(null);
	};

	return (
		<nav aria-label={ariaLabel} className="flex justify-end">
			<div
				data-compact-navigation-rail-list="true"
				data-scrubbing={scrubbedItemId ? "true" : undefined}
				className="flex max-h-[min(70dvh,40rem)] w-9 touch-pan-x touch-pinch-zoom select-none flex-col overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				onLostPointerCapture={stopScrubbing}
				onPointerCancel={stopScrubbing}
				onPointerDown={(event) => {
					if (event.button !== 0) {
						return;
					}

					const item = getItemFromPointerEvent(event);

					if (!item) {
						return;
					}

					scrubPointerRef.current = {
						pointerId: event.pointerId,
						target: event.currentTarget,
					};
					scrubMovedRef.current = false;
					event.currentTarget.setPointerCapture?.(event.pointerId);
					setScrubbedItemId(item.id);
					onReveal(item, "auto");
				}}
				onPointerEnter={() => {
					if (!scrubPointerRef.current) {
						setHoveredItemId(selectedItem?.id ?? null);
					}
				}}
				onPointerLeave={() => {
					if (!scrubPointerRef.current) {
						setHoveredItemId(null);
					}
				}}
				onPointerMove={(event) => {
					const item = getItemFromPointerEvent(event);

					if (!scrubPointerRef.current) {
						setHoveredItemId(item?.id ?? null);
						return;
					}

					if (item && item.id !== scrubbedItemId) {
						scrubMovedRef.current = true;
						setScrubbedItemId(item.id);
						onReveal(item, "auto");
					}
				}}
				onPointerUp={stopScrubbing}
			>
				{items.map((item, index) => {
					const isActive = index === activeIndex;
					const selectedIndex = selectedItem
						? items.findIndex((candidate) => candidate.id === selectedItem.id)
						: -1;
					const distance =
						selectedIndex >= 0
							? Math.abs(index - selectedIndex)
							: Number.POSITIVE_INFINITY;
					const shouldEmphasize =
						distance <= MAX_MARKER_DISTANCE ||
						isActive ||
						item.id === selectedItem?.id;

					return (
						<button
							key={item.id}
							type="button"
							data-compact-navigation-rail-id={railInstanceId}
							data-compact-navigation-rail-item-id={item.id}
							data-scrub-target={
								scrubbedItemId === item.id ? "true" : undefined
							}
							aria-current={isActive ? "location" : undefined}
							aria-label={item.ariaLabel}
							className="group/navigation-row flex h-2.5 w-9 shrink-0 cursor-pointer items-center justify-end outline-none"
							onClick={() => {
								if (scrubMovedRef.current) {
									scrubMovedRef.current = false;
									return;
								}

								onReveal(item, "smooth");
							}}
							onFocus={() => {
								setHoveredItemId(item.id);
							}}
							onBlur={() => {
								setHoveredItemId((current) =>
									current === item.id ? null : current,
								);
							}}
						>
							<span
								className={cn(
									"h-0.5 rounded-full bg-muted-foreground/40 transition-[width,background-color,opacity] duration-150 group-focus-visible/navigation-row:bg-foreground group-focus-visible/navigation-row:opacity-100 motion-reduce:transition-none",
									selectedItem
										? getMarkerWidthClass(distance)
										: COMPACT_MARKER_WIDTH_CLASS,
									shouldEmphasize ? "opacity-100" : "opacity-60",
									isActive && scrubbedItemId !== item.id
										? "bg-foreground/60"
										: null,
									item.id === selectedItem?.id
										? "bg-foreground opacity-100"
										: null,
								)}
							/>
						</button>
					);
				})}
			</div>
			{selectedItem ? (
				<CompactNavigationRailPreview
					item={selectedItem}
					railInstanceId={railInstanceId}
					renderPreview={renderPreview}
				/>
			) : null}
		</nav>
	);
}

function CompactNavigationRailPreview<TItem extends CompactNavigationRailItem>({
	item,
	railInstanceId,
	renderPreview,
}: {
	item: TItem;
	railInstanceId: string;
	renderPreview: (item: TItem) => React.ReactNode;
}) {
	const [portalState, setPortalState] = React.useState<{
		container: HTMLElement;
		position: {
			left: number;
			top: number;
		};
	} | null>(null);

	React.useLayoutEffect(() => {
		const itemElement = document.querySelector<HTMLElement>(
			`[data-compact-navigation-rail-id="${escapeSelectorValue(railInstanceId)}"][data-compact-navigation-rail-item-id="${escapeSelectorValue(item.id)}"]`,
		);

		if (!itemElement) {
			setPortalState(null);
			return;
		}

		const rect = itemElement.getBoundingClientRect();
		setPortalState({
			container: document.body,
			position: {
				left: rect.left - PREVIEW_OFFSET,
				top: rect.top + rect.height / 2,
			},
		});
	}, [item.id, railInstanceId]);

	if (!portalState) {
		return null;
	}

	return createPortal(
		<div
			className="pointer-events-none fixed z-50 w-80 max-w-[calc(100vw-4rem)] -translate-x-full -translate-y-1/2 rounded-xl bg-popover/95 p-2 text-left text-xs leading-4 text-popover-foreground shadow-xl ring-1 ring-border backdrop-blur-sm"
			style={{
				left: portalState.position.left,
				top: portalState.position.top,
			}}
		>
			{renderPreview(item)}
		</div>,
		portalState.container,
	);
}
