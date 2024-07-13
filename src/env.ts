import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import os from "node:os";

type ConfigFile = {
	logger?: {
		discordWebhookUrl?: string;
		diunTrackerUrl?: string;
	};
};

const configFile = (await Bun.file(
	`${os.homedir()}/.config/docker-updater/config.json`,
).json()) as ConfigFile;

export const env = createEnv({
	server: {
		DISCORD_WEBHOOK_URL: z.string().url().optional(),
		DIUN_TRACKER_URL: z.string().url().optional(),
	},
	client: {},
	runtimeEnv: {
		DISCORD_WEBHOOK_URL:
			process.env.DISCORD_WEBHOOK_URL ?? configFile.logger?.discordWebhookUrl,
		DIUN_TRACKER_URL:
			process.env.DIUN_TRACKER_URL ?? configFile.logger?.diunTrackerUrl,
	},
});
