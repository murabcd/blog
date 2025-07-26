"use client";

import { Heart } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LikeButtonProps {
	postSlug: string;
}

export function LikeButton({ postSlug }: LikeButtonProps) {
	const [visitorId, setVisitorId] = useState<string>("");

	useEffect(() => {
		let id = localStorage.getItem("visitorId");
		if (!id) {
			id = crypto.randomUUID();
			localStorage.setItem("visitorId", id);
		}
		setVisitorId(id);
	}, []);

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
			<Button variant="ghost" size="sm" disabled>
				<Heart className="w-4 h-4 mr-1 text-muted-foreground" />
				<span className="text-xs">0</span>
			</Button>
		);
	}

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleLike}
			aria-pressed={!!isLiked}
		>
			<Heart
				className={`w-4 h-4 mr-1 transition-colors ${
					isLiked ? "fill-foreground text-foreground" : "text-muted-foreground"
				}`}
			/>
			<span className="text-xs">{likeCount}</span>
		</Button>
	);
}
