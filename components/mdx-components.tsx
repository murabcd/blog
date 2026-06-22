import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import React from "react";
import { CodeBlock } from "@/components/code-block";
import { getNodeText } from "@/lib/mdx-heading";

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

type PreProps = React.HTMLAttributes<HTMLPreElement> & {
	children?: React.ReactNode;
};

type CodeElementProps = {
	children?: React.ReactNode;
	className?: string;
};

export function Table({ data }: TableProps) {
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

export function CustomLink(props: CustomLinkProps) {
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
		const { children, ...rest } = props;
		return <a {...rest}>{children || href}</a>;
	}

	const { children, ...rest } = props;
	return (
		<a
			target="_blank"
			rel="noopener noreferrer"
			{...rest}
			className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
		>
			{children || href}
		</a>
	);
}

export function RoundedImage(props: ImageProps) {
	const { alt = "", ...rest } = props;
	return <Image alt={alt} className="rounded-lg" {...rest} />;
}

function extractCodeString(children: React.ReactNode): string {
	if (isCodeElement(children)) {
		return extractCodeString(children.props.children);
	}

	if (Array.isArray(children)) {
		return children.map((c) => extractCodeString(c)).join("");
	}

	return getNodeText(children);
}

export function Code({ children, className, ...props }: CodeProps) {
	return (
		<code
			className={`${className || ""} bg-muted px-1.5 py-0.5 rounded text-sm font-mono`}
			{...props}
		>
			{children}
		</code>
	);
}

function isCodeElement(
	children: React.ReactNode,
): children is React.ReactElement<CodeElementProps> {
	return React.isValidElement<CodeElementProps>(children);
}

export function Pre({ children, ...props }: PreProps) {
	if (isCodeElement(children)) {
		const codeString = extractCodeString(children.props.children).replace(
			/\n$/,
			"",
		);

		return (
			<CodeBlock className={children.props.className}>{codeString}</CodeBlock>
		);
	}

	return <pre {...props}>{children}</pre>;
}

export function Blockquote(
	props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>,
) {
	return (
		<blockquote
			className="border-l-3 border-neutral-300 pl-4 my-4"
			{...props}
		/>
	);
}
