import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import React from "react";
import { CodeBlock } from "@/components/code-block";
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
	children?: string | React.ReactNode;
	className?: string;
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
		<tr key={row.join("-")}>
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

function extractCodeString(children: React.ReactNode): string {
	if (typeof children === "string") return children;

	if (
		typeof children === "object" &&
		children !== null &&
		"props" in children
	) {
		return String(
			(children as { props?: { children?: string | React.ReactNode } }).props
				?.children || "",
		);
	}

	if (Array.isArray(children)) {
		return children.map((c) => extractCodeString(c)).join("");
	}

	return String(children || "");
}

function Code({ children, className, ...props }: CodeProps) {
	// Inline code - simple styling without highlighting
	return (
		<code
			className={`${className || ""} bg-muted px-1.5 py-0.5 rounded text-sm font-mono`}
			{...props}
		>
			{children}
		</code>
	);
}

type PreProps = React.HTMLAttributes<HTMLPreElement> & {
	children?: React.ReactNode;
};

function Pre({ children, ...props }: PreProps) {
	if (React.isValidElement(children)) {
		const className =
			typeof (children.props as { className?: unknown })?.className === "string"
				? ((children.props as { className?: string }).className as string)
				: undefined;
		const codeString = extractCodeString(
			(children.props as { children?: React.ReactNode })?.children,
		).replace(/\n$/, "");

		// Treat any <pre><code>...</code></pre> block as a code block, even if no language was specified.
		return <CodeBlock className={className}>{codeString}</CodeBlock>;
	}

	return <pre {...props}>{children}</pre>;
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
	pre: Pre,
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
