"use client";

import { CompactNavigationRail } from "@/components/compact-navigation-rail";
import type { TocSection } from "@/components/toc";

function getHeadingPreview(id: string) {
	const parts: string[] = [];
	let element = document.getElementById(id)?.nextElementSibling;

	while (element && !/^H[1-6]$/u.test(element.tagName)) {
		const text = element.textContent?.trim();
		if (text) parts.push(text);
		element = element.nextElementSibling;
	}

	return parts.join(" ");
}

export function CompactToc({
	sections,
	activeId,
	onReveal,
}: {
	sections: TocSection[];
	activeId: string;
	onReveal: (id: string, behavior: ScrollBehavior) => void;
}) {
	const items = sections.flatMap(({ id, label, children }) => [
		{ id, ariaLabel: label },
		...(children?.map((child) => ({
			id: child.id,
			ariaLabel: child.label,
		})) ?? []),
	]);

	return (
		<CompactNavigationRail
			activeIndex={Math.max(
				0,
				items.findIndex((item) => item.id === activeId),
			)}
			ariaLabel="Table of contents"
			items={items}
			onReveal={(item, behavior) => onReveal(item.id, behavior)}
			renderPreview={(item) => (
				<div className="flex min-w-0 flex-col gap-1">
					<div className="min-w-0 truncate font-medium">{item.ariaLabel}</div>
					<div className="line-clamp-3 text-muted-foreground">
						{getHeadingPreview(item.id)}
					</div>
				</div>
			)}
		/>
	);
}
