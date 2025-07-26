import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import React from "react";
import { highlight } from "sugar-high";
import { slugify } from "@/lib/utils";

type TableProps = {
	data: {
		headers: string[];
		rows: string[][];
	};
};

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	children?: React.ReactNode;
};

type CodeProps = React.HTMLAttributes<HTMLElement> & {
	children?: string;
};

type HeadingProps = {
	children?: React.ReactNode;
};

function createHeading(level: number) {
	const Heading = ({ children }: HeadingProps) => {
		const slug = slugify(typeof children === "string" ? children : "");
		return React.createElement(
			`h${level}`,
			{ id: slug, style: { scrollMarginTop: "6rem" } },
			[
				React.createElement("a", {
					href: `#${slug}`,
					key: `link-${slug}`,
					className: "anchor",
				}),
			],
			children,
		);
	};

	Heading.displayName = `Heading${level}`;

	return Heading;
}

function Table({ data }: TableProps) {
	const headers = data.headers.map((header: string) => (
		<th key={header}>{header}</th>
	));
	const rows = data.rows.map((row: string[]) => (
		<tr key={row.join('-')}>
			{row.map((cell: string) => (
				<td key={cell}>{cell}</td>
			))}
		</tr>
	));

	return (
		<table>
			<thead>
				<tr>{headers}</tr>
			</thead>
			<tbody>{rows}</tbody>
		</table>
	);
}

function CustomLink(props: CustomLinkProps) {
	const href = props.href || "";

	if (href.startsWith("/")) {
		const { children, ...rest } = props;
		return (
			<Link href={href} {...rest}>
				{children}
			</Link>
		);
	}

	if (href.startsWith("#")) {
		return <a {...props} />;
	}

	return (
		<a
			target="_blank"
			rel="noopener noreferrer"
			{...props}
			className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
		/>
	);
}

function RoundedImage(props: ImageProps) {
	const { alt = "", ...rest } = props;
	return <Image alt={alt} className="rounded-lg" {...rest} />;
}

function Code({ children, ...props }: CodeProps) {
	const codeHTML = highlight(children || "");
	// biome-ignore lint/security/noDangerouslySetInnerHtml: syntax highlighting HTML
	return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function Blockquote(props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
	return (
		<blockquote
			className="border-l-3 border-neutral-300 pl-4 my-4"
			{...props}
		/>
	);
}

const components = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
	Image: RoundedImage,
	a: CustomLink,
	code: Code,
	Table,
	blockquote: Blockquote,
};

export function CustomMDX(props: MDXRemoteProps) {
	return (
		<MDXRemote
			{...props}
			components={{ ...components, ...(props.components || {}) }}
		/>
	);
}
