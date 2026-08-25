"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const BASE_URL = "https://chatgpt.com";

function buildPrompt({ url, question }: { url: string; question: string }) {
	const trimmed = question.trim();
	if (!trimmed) return url;
	return `${url} ${trimmed}`;
}

function getChatVisibilitySnapshot() {
	const footer = document.querySelector<HTMLElement>("footer");
	return !footer || footer.getBoundingClientRect().top > window.innerHeight;
}

function getServerChatVisibilitySnapshot() {
	return true;
}

function subscribeToChatVisibility(onStoreChange: () => void) {
	const footer = document.querySelector<HTMLElement>("footer");
	if (!footer) return () => {};

	const observer = new IntersectionObserver(() => {
		onStoreChange();
	});

	observer.observe(footer);
	window.addEventListener("resize", onStoreChange);
	window.addEventListener("scroll", onStoreChange, { passive: true });

	return () => {
		observer.disconnect();
		window.removeEventListener("resize", onStoreChange);
		window.removeEventListener("scroll", onStoreChange);
	};
}

export function FloatingChatInput({ url }: { url: string }) {
	const [value, setValue] = useState("");
	const [hasScrolled, setHasScrolled] = useState(false);
	const isVisible = useSyncExternalStore(
		subscribeToChatVisibility,
		getChatVisibilitySnapshot,
		getServerChatVisibilitySnapshot,
	);
	const canSubmit = value.trim().length > 0;
	const promptUrl = useMemo(() => {
		const prompt = buildPrompt({ url, question: value });
		return `${BASE_URL}?q=${encodeURIComponent(prompt)}`;
	}, [url, value]);

	useEffect(() => {
		const enableScrollTransitions = () => setHasScrolled(true);
		window.addEventListener("scroll", enableScrollTransitions, {
			once: true,
			passive: true,
		});

		return () => window.removeEventListener("scroll", enableScrollTransitions);
	}, []);

	return (
		<div
			className={`fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 pointer-events-none motion-reduce:translate-y-0 ${
				hasScrolled
					? "transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity"
					: ""
			} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
		>
			<div className="w-full max-w-2xl pointer-events-none">
				<div className="mx-auto w-full max-w-[315px]">
					<div
						className={`group relative flex items-center gap-2 rounded-full bg-foreground/10 pl-4 pr-1 py-1.5 [clip-path:inset(0_65px_round_9999px)] transition-[clip-path] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none focus-within:[clip-path:inset(0_0_round_9999px)] ${
							isVisible ? "pointer-events-auto" : "pointer-events-none"
						}`}
					>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-px rounded-full bg-background/95 dark:bg-background/90 [clip-path:inset(0_65px_round_9999px)] transition-[clip-path] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none group-focus-within:[clip-path:inset(0_0_round_9999px)]"
						/>
						<label className="sr-only" htmlFor="floating-chat-input">
							Ask about this post
						</label>
						<div className="min-w-0 flex-1 translate-x-[65px] transition-[translate] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none group-focus-within:translate-x-0">
							<Input
								id="floating-chat-input"
								value={value}
								onChange={(event) => setValue(event.target.value)}
								placeholder="Ask AI…"
								className="h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 text-base sm:text-sm text-foreground/90 shadow-none outline-none placeholder:text-foreground/50 focus-visible:ring-0 rounded-none dark:bg-transparent"
								autoComplete="off"
								autoCorrect="off"
								spellCheck={false}
								onKeyDown={(event) => {
									if (event.key !== "Enter" || !canSubmit) return;
									window.open(promptUrl, "_blank", "noopener,noreferrer");
								}}
							/>
						</div>
						<Button
							type="button"
							size="icon"
							disabled={!canSubmit}
							aria-label="Ask about this post"
							className="shrink-0 size-8 -translate-x-[65px] rounded-full bg-foreground text-background transition-[translate] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none group-focus-within:translate-x-0 disabled:cursor-not-allowed"
							onClick={() =>
								window.open(promptUrl, "_blank", "noopener,noreferrer")
							}
						>
							<ArrowUp className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
