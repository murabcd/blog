"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const cursorDarkTheme: { [key: string]: React.CSSProperties } = {
	'code[class*="language-"]': {
		color: "#d4d4d4",
		background: "transparent",
		fontFamily:
			"SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
		fontSize: "14px",
		textAlign: "left" as const,
		whiteSpace: "pre" as const,
		wordSpacing: "normal",
		wordBreak: "normal" as const,
		wordWrap: "normal" as const,
		lineHeight: "1.6",
		tabSize: 4,
		hyphens: "none" as const,
	},
	'pre[class*="language-"]': {
		color: "#d4d4d4",
		background: "#1e1e1e",
		fontFamily:
			"SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
		fontSize: "14px",
		textAlign: "left" as const,
		whiteSpace: "pre" as const,
		wordSpacing: "normal",
		wordBreak: "normal" as const,
		wordWrap: "normal" as const,
		lineHeight: "1.6",
		tabSize: 4,
		hyphens: "none" as const,
		padding: "1.5em",
		margin: "1.5em 0",
		overflow: "auto" as const,
		borderRadius: "8px",
	},
	comment: { color: "#6a9955", fontStyle: "italic" },
	prolog: { color: "#6a9955" },
	doctype: { color: "#6a9955" },
	cdata: { color: "#6a9955" },
	punctuation: { color: "#d4d4d4" },
	property: { color: "#9cdcfe" },
	tag: { color: "#569cd6" },
	boolean: { color: "#569cd6" },
	number: { color: "#b5cea8" },
	constant: { color: "#4fc1ff" },
	symbol: { color: "#4fc1ff" },
	deleted: { color: "#f44747" },
	selector: { color: "#d7ba7d" },
	"attr-name": { color: "#92c5f6" },
	string: { color: "#ce9178" },
	char: { color: "#ce9178" },
	builtin: { color: "#569cd6" },
	inserted: { color: "#6a9955" },
	operator: { color: "#d4d4d4" },
	entity: { color: "#dcdcaa" },
	url: { color: "#9cdcfe", textDecoration: "underline" },
	variable: { color: "#9cdcfe" },
	atrule: { color: "#569cd6" },
	"attr-value": { color: "#ce9178" },
	function: { color: "#dcdcaa" },
	"function-variable": { color: "#dcdcaa" },
	keyword: { color: "#569cd6" },
	regex: { color: "#d16969" },
	important: { color: "#569cd6", fontWeight: "bold" },
	bold: { fontWeight: "bold" },
	italic: { fontStyle: "italic" },
	namespace: { opacity: 0.7 },
	"class-name": { color: "#4ec9b0" },
	parameter: { color: "#9cdcfe" },
	decorator: { color: "#dcdcaa" },
};

const cursorLightTheme: { [key: string]: React.CSSProperties } = {
	'code[class*="language-"]': {
		color: "#171717",
		background: "transparent",
		fontFamily:
			"SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
		fontSize: "14px",
		textAlign: "left" as const,
		whiteSpace: "pre" as const,
		wordSpacing: "normal",
		wordBreak: "normal" as const,
		wordWrap: "normal" as const,
		lineHeight: "1.6",
		tabSize: 4,
		hyphens: "none" as const,
	},
	'pre[class*="language-"]': {
		color: "#171717",
		background: "#f5f5f5",
		fontFamily:
			"SF Mono, Monaco, Cascadia Code, Roboto Mono, Consolas, Courier New, monospace",
		fontSize: "14px",
		textAlign: "left" as const,
		whiteSpace: "pre" as const,
		wordSpacing: "normal",
		wordBreak: "normal" as const,
		wordWrap: "normal" as const,
		lineHeight: "1.6",
		tabSize: 4,
		hyphens: "none" as const,
		padding: "1.5em",
		margin: "1.5em 0",
		overflow: "auto" as const,
		borderRadius: "8px",
	},
	comment: { color: "#6a737d", fontStyle: "italic" },
	prolog: { color: "#6a737d" },
	doctype: { color: "#6a737d" },
	cdata: { color: "#6a737d" },
	punctuation: { color: "#24292e" },
	property: { color: "#005cc5" },
	tag: { color: "#22863a" },
	boolean: { color: "#005cc5" },
	number: { color: "#005cc5" },
	constant: { color: "#005cc5" },
	symbol: { color: "#e36209" },
	deleted: { color: "#b31d28", background: "#ffeef0" },
	selector: { color: "#22863a" },
	"attr-name": { color: "#6f42c1" },
	string: { color: "#032f62" },
	char: { color: "#032f62" },
	builtin: { color: "#005cc5" },
	inserted: { color: "#22863a", background: "#f0fff4" },
	operator: { color: "#d73a49" },
	entity: { color: "#6f42c1" },
	url: { color: "#005cc5", textDecoration: "underline" },
	variable: { color: "#e36209" },
	atrule: { color: "#005cc5" },
	"attr-value": { color: "#032f62" },
	function: { color: "#6f42c1" },
	"function-variable": { color: "#6f42c1" },
	keyword: { color: "#d73a49" },
	regex: { color: "#032f62" },
	important: { color: "#d73a49", fontWeight: "bold" },
	bold: { fontWeight: "bold" },
	italic: { fontStyle: "italic" },
	namespace: { opacity: 0.7 },
	"class-name": { color: "#6f42c1" },
	parameter: { color: "#24292e" },
	decorator: { color: "#6f42c1" },
};

function CodeCopyButton({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			toast.success("Copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy code:", error);
			toast.error("Failed to copy code");
		}
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="absolute top-2 right-2 z-10 flex items-center justify-center w-7 h-7 p-0 bg-background/80 border border-border rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 shadow-xs active:scale-95 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] cursor-pointer"
			aria-label={copied ? "Copied!" : "Copy code"}
			title={copied ? "Copied!" : "Copy code"}
		>
			{copied ? (
				<Check className="h-3.5 w-3.5" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</button>
	);
}

type CodeBlockProps = {
	children: string;
	className?: string;
};

export function CodeBlock({ children, className }: CodeBlockProps) {
	const { theme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const match = /language-(\w+)/.exec(className || "");
	const language = match ? match[1] : "text";
	const codeString = String(children).replace(/\n$/, "");

	const capitalizeLanguage = (lang: string) => {
		return lang.toLowerCase();
	};

	const getCodeTheme = () => {
		if (!mounted) return cursorDarkTheme;
		const currentTheme = resolvedTheme || theme || "dark";
		return currentTheme === "dark" ? cursorDarkTheme : cursorLightTheme;
	};

	return (
		<div className="relative group my-6">
			{match && (
				<span className="absolute top-2 right-11 text-xs font-medium text-muted-foreground tracking-wider z-10 pointer-events-none">
					{capitalizeLanguage(language)}
				</span>
			)}
			<CodeCopyButton code={codeString} />
			<SyntaxHighlighter
				style={getCodeTheme()}
				language={language}
				PreTag="div"
				className="rounded-lg"
			>
				{codeString}
			</SyntaxHighlighter>
		</div>
	);
}
