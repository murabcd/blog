import { getBlogPosts } from "@/lib/server-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = getBlogPosts();
  return NextResponse.json(posts);
}
