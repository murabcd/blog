type LogLevel = "info" | "error";

type LogEvent = Record<string, unknown>;

const ENV_CONTEXT = {
	service: "blog-web",
	deploymentEnv:
		process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
	region: process.env.VERCEL_REGION ?? "unknown",
	commitHash: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
	version: process.env.npm_package_version ?? "unknown",
};

function emit(level: LogLevel, event: LogEvent) {
	const payload = {
		timestamp: new Date().toISOString(),
		level,
		...ENV_CONTEXT,
		...event,
	};

	const line = JSON.stringify(payload);
	if (level === "error") {
		console.error(line);
		return;
	}

	console.info(line);
}

export const logger = {
	info(event: LogEvent) {
		emit("info", event);
	},
	error(event: LogEvent) {
		emit("error", event);
	},
};
