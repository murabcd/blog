"use client";

import { Heart } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
	postSlug: string;
}

export function LikeButton({ postSlug }: LikeButtonProps) {
	const [visitorId, setVisitorId] = useState<string>("");
	const [showFloatingHearts, setShowFloatingHearts] = useState(false);

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

			// Show floating hearts animation when liking
			if (liked) {
				setShowFloatingHearts(true);
				setTimeout(() => setShowFloatingHearts(false), 1000);
			}

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
				className="h-8 shadow-none md:h-7 md:text-[0.8rem]"
			>
				<Heart className="w-4 h-4 mr-1 text-muted-foreground" />
				<span className="text-xs">0</span>
			</Button>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<motion.div
				className="relative flex items-center justify-center"
				whileTap={{ scale: 0.8 }}
				transition={{ type: "spring", stiffness: 400, damping: 17 }}
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleLike}
					aria-pressed={!!isLiked}
					className="cursor-pointer h-8 shadow-none md:h-7 md:text-[0.8rem]"
				>
					<motion.div
						animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<Heart
							className={`w-4 h-4 transition-all duration-300 ${
								isLiked
									? "fill-foreground text-foreground"
									: "text-muted-foreground"
							}`}
						/>
					</motion.div>
				</Button>

				{/* Floating hearts animation */}
				<AnimatePresence>
					{showFloatingHearts && (
						<motion.div
							className="absolute inset-0 pointer-events-none"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							{[...Array(6)].map((_, i) => (
								<motion.div
									key={`floating-heart-${i}-${Date.now()}`}
									className="absolute"
									initial={{
										x: 0,
										y: 0,
										scale: 0,
										rotate: 0,
									}}
									animate={{
										x: (Math.random() - 0.5) * 100,
										y: -50 - Math.random() * 50,
										scale: [0, 1, 0],
										rotate: Math.random() * 360,
									}}
									transition={{
										duration: 1,
										delay: i * 0.1,
										ease: "easeOut",
									}}
								>
									<Heart className="w-3 h-3 fill-foreground text-foreground" />
								</motion.div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			<motion.span
				className="text-xs"
				animate={{ scale: isLiked ? [1, 1.1, 1] : 1 }}
				transition={{ duration: 0.2 }}
			>
				{likeCount}
			</motion.span>
		</div>
	);
}
