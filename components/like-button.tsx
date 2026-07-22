"use client";

import { Heart } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LikeButtonProps {
	postSlug: string;
}

function getVisitorIdSnapshot() {
	return localStorage.getItem("visitorId");
}

function getServerVisitorIdSnapshot() {
	return null;
}

function subscribeToVisitorId(onStoreChange: () => void) {
	if (!localStorage.getItem("visitorId")) {
		localStorage.setItem("visitorId", crypto.randomUUID());
		onStoreChange();
	}

	function handleStorage(event: StorageEvent) {
		if (event.key === "visitorId") onStoreChange();
	}

	window.addEventListener("storage", handleStorage);
	return () => window.removeEventListener("storage", handleStorage);
}

export function LikeButton({ postSlug }: LikeButtonProps) {
	const visitorId = useSyncExternalStore(
		subscribeToVisitorId,
		getVisitorIdSnapshot,
		getServerVisitorIdSnapshot,
	);

	const likeCount = useQuery(api.posts.getLikeCount, { postSlug });
	const isLiked = useQuery(
		api.posts.getIsLiked,
		visitorId ? { postSlug, visitorId } : "skip",
	);
	const toggleLike = useMutation(api.posts.toggleLike);

	const handleLike = async () => {
		if (!visitorId) return;

		try {
			const liked = await toggleLike({ postSlug, visitorId });

			if (liked) {
				toast.success("Post liked");
			} else {
				toast.success("Post unliked");
			}
		} catch (error) {
			console.error("Failed to toggle like:", error);
			toast.error("Failed to update like status");
		}
	};

	if (!visitorId || likeCount === undefined || isLiked === undefined) {
		return (
			<Button
				variant="ghost"
				size="sm"
				disabled
				aria-label="Like post"
				className="h-8 shadow-none md:h-7 md:text-[0.8rem]"
			>
				<Heart className="w-4 h-4 mr-1 text-muted-foreground" />
				<span className="text-xs">0</span>
			</Button>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<div className="relative flex items-center justify-center">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleLike}
					aria-pressed={!!isLiked}
					aria-label={isLiked ? "Unlike post" : "Like post"}
					className="h-8 shadow-none md:h-7 md:text-[0.8rem]"
				>
					<Heart
						className={`w-4 h-4 transition-colors duration-300 ${
							isLiked
								? "fill-foreground text-foreground"
								: "text-muted-foreground"
						}`}
					/>
				</Button>
			</div>

			<span className="text-xs">{likeCount}</span>
		</div>
	);
}
