"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://chatgpt.com";

function buildPrompt({ url, question }: { url: string; question: string }) {
	const trimmed = question.trim();
	if (!trimmed) return url;
	return `${url} ${trimmed}`;
}

export function FloatingChatInput({
	url,
}: {
	url: string;
}) {
	const [value, setValue] = useState("");
	const [isVisible, setIsVisible] = useState(true);
	const promptUrl = useMemo(() => {
		const prompt = buildPrompt({ url, question: value });
		return `${BASE_URL}?q=${encodeURIComponent(prompt)}`;
	}, [url, value]);

	useEffect(() => {
		const footer = document.querySelector<HTMLElement>("footer");
		if (!footer) return;
		const updateVisibility = () => {
			const footerTop = footer.getBoundingClientRect().top;
			setIsVisible(footerTop > window.innerHeight);
		};
		updateVisibility();
		window.addEventListener("scroll", updateVisibility, { passive: true });
		window.addEventListener("resize", updateVisibility);
		return () => {
			window.removeEventListener("scroll", updateVisibility);
			window.removeEventListener("resize", updateVisibility);
		};
	}, []);

	return (
		<div
			className={`fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 pointer-events-none transition-all duration-300 ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
			}`}
		>
			<div className="w-full max-w-2xl pointer-events-none">
				<div className="mx-auto w-full max-w-[185px] transition-[max-width] duration-300 focus-within:max-w-[315px]">
					<form
						className="pointer-events-auto relative flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 dark:bg-background/60 pl-4 pr-1 py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-[0_18px_40px_rgba(0,0,0,0.3)]"
						onSubmit={(event) => {
							event.preventDefault();
							window.open(promptUrl, "_blank", "noopener,noreferrer");
						}}
					>
						<label className="sr-only" htmlFor="floating-chat-input">
							Ask about this post
						</label>
						<div className="min-w-0 flex-1">
							<Input
								id="floating-chat-input"
								value={value}
								onChange={(event) => setValue(event.target.value)}
								placeholder="Ask AI…"
								className="h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 text-sm text-foreground/90 shadow-none outline-none placeholder:text-foreground/50 focus-visible:ring-0 rounded-none dark:bg-transparent"
								autoComplete="off"
								autoCorrect="off"
								spellCheck={false}
							/>
						</div>
						<Button
							type="submit"
							size="icon"
							className="shrink-0 size-8 rounded-full bg-foreground text-background transition-transform duration-200 hover:-translate-y-0.5"
						>
							<ArrowUp className="size-4" />
						</Button>
					</form>
				</div>
			</div>
		</div>
	);
}
