import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

type RevalidateRequest = {
	tags?: string[];
};

function getSecretHeader(request: Request) {
	return request.headers.get("x-revalidate-secret");
}

export async function POST(request: Request) {
	const secret = getSecretHeader(request);
	const expected = process.env.REVALIDATE_SECRET;

	if (!expected || secret !== expected) {
		return NextResponse.json({ ok: false }, { status: 401 });
	}

	let payload: RevalidateRequest | null = null;
	try {
		payload = (await request.json()) as RevalidateRequest;
	} catch {
		// Ignore invalid JSON
	}

	const tags = Array.isArray(payload?.tags) ? payload?.tags : [];
	if (tags.length === 0) {
		return NextResponse.json(
			{ ok: false, error: "Missing tags" },
			{ status: 400 },
		);
	}

	for (const tag of tags) {
		revalidateTag(tag);
	}

	return NextResponse.json({ ok: true, tags });
}
