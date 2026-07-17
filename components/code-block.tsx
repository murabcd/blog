import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CodeCopyButton } from "@/components/code-copy-button";

type CodeBlockProps = {
	children: string;
	className?: string;
};

export function CodeBlock({ children, className }: CodeBlockProps) {
	const languageMatch = /language-([\w-]+)/.exec(className ?? "");
	const language = languageMatch?.[1] ?? "text";
	const code = children.replace(/\n$/, "");

	return (
		<div className="relative group my-6">
			{languageMatch && (
				<span className="absolute top-2 right-11 z-10 text-xs font-medium text-muted-foreground tracking-wider pointer-events-none">
					{language.toLowerCase()}
				</span>
			)}
			<CodeCopyButton code={code} />
			<SyntaxHighlighter
				language={language}
				PreTag="div"
				className="code-highlight"
				useInlineStyles={false}
			>
				{code}
			</SyntaxHighlighter>
		</div>
	);
}
