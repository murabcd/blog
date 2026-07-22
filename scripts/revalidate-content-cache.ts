const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 250;
const REQUEST_TIMEOUT_MS = 10_000;

type RevalidateContentCacheOptions = {
	secret: string;
	siteUrl: string;
	tags: readonly [string, ...string[]];
};

function isRetryableStatus(status: number) {
	return status === 408 || status === 429 || status >= 500;
}

function waitBeforeRetry(attempt: number) {
	return new Promise((resolve) =>
		setTimeout(resolve, RETRY_DELAY_MS * 2 ** (attempt - 1)),
	);
}

export async function revalidateContentCache({
	secret,
	siteUrl,
	tags,
}: RevalidateContentCacheOptions) {
	const endpoint = new URL("/api/revalidate", siteUrl);

	for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
		let response: Response;
		try {
			response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-revalidate-secret": secret,
				},
				body: JSON.stringify({ tags }),
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			});
		} catch (error) {
			if (attempt === MAX_ATTEMPTS) {
				throw new Error(
					`Cache revalidation request failed after ${MAX_ATTEMPTS} attempts`,
					{ cause: error },
				);
			}

			console.warn(
				`Cache revalidation request failed; retrying (${attempt}/${MAX_ATTEMPTS})`,
				error,
			);
			await waitBeforeRetry(attempt);
			continue;
		}

		if (response.ok) return;

		const detail = (await response.text()).slice(0, 500);
		const message = `Cache revalidation failed (${response.status})${detail ? `: ${detail}` : ""}`;
		if (!isRetryableStatus(response.status) || attempt === MAX_ATTEMPTS) {
			throw new Error(message);
		}

		console.warn(`${message}; retrying (${attempt}/${MAX_ATTEMPTS})`);
		await waitBeforeRetry(attempt);
	}
}
