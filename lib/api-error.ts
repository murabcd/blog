type ApiErrorResponseOptions = {
	code: string;
	message: string;
	resolution: string;
	status: number;
};

export function createApiErrorResponse({
	code,
	message,
	resolution,
	status,
}: ApiErrorResponseOptions) {
	return Response.json(
		{
			error: {
				code,
				message,
				resolution,
			},
		},
		{
			status,
			headers: {
				"Cache-Control": "no-store",
			},
		},
	);
}
