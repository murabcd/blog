import { createOpenApiDocument } from "@/lib/openapi";
import { baseUrl } from "@/lib/site";

export function GET() {
	return Response.json(createOpenApiDocument(baseUrl), {
		headers: {
			"Cache-Control": "public, max-age=3600",
		},
	});
}
