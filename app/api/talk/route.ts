import { getTalksEvents } from "@/lib/server-utils";
import { NextResponse } from "next/server";

export async function GET() {
  const talks = getTalksEvents();
  return NextResponse.json(talks);
}
