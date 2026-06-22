import React from "react";
import { slugify } from "@/lib/utils";

type HeadingProps = {
	children?: React.ReactNode;
};

export function getNodeText(node: React.ReactNode): string {
	return React.Children.toArray(node)
		.map((child) => {
			if (typeof child === "string" || typeof child === "number") {
				return String(child);
			}

			if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
				return getNodeText(child.props.children);
			}

			return "";
		})
		.join("");
}

export function createHeading(level: number) {
	const Heading = ({ children }: HeadingProps) => {
		const text = getNodeText(children);
		const slug = slugify(text);
		return React.createElement(
			`h${level}`,
			{ id: slug, style: { scrollMarginTop: "6rem" } },
			[
				React.createElement(
					"a",
					{
						href: `#${slug}`,
						key: `link-${slug}`,
						className: "anchor",
						"aria-label": `Link to ${text || "heading"}`,
					},
					"#",
				),
			],
			children,
		);
	};

	Heading.displayName = `Heading${level}`;

	return Heading;
}
