import os from "node:os";
import { select } from "@inquirer/prompts";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

type ConfigFile = {
	logger?: {
		discordWebhookUrl?: string;
		diunTrackerUrl?: string;
	};
	regctl?: {
		path?: string;
	};
	docker?: {
		hosts?: Record<string, string>;
	};
};

const configFile = (await Bun.file(
	`${os.homedir()}/.config/docker-updater/config.json`,
).json()) as ConfigFile;

export const env = createEnv({
	server: {
		DISCORD_WEBHOOK_URL: z.string().url().optional(),
		DIUN_TRACKER_URL: z.string().url().optional(),
		DOCKER_HOSTS: z.preprocess(
			(hosts) => JSON.parse(hosts as string),
			z.record(z.string()),
		),
		REGCTL_PATH: z.string().optional(),

		DOCKER_HOST: z.string().optional(),
	},
	client: {},
	runtimeEnv: {
		DISCORD_WEBHOOK_URL:
			process.env.DISCORD_WEBHOOK_URL ?? configFile.logger?.discordWebhookUrl,
		DIUN_TRACKER_URL:
			process.env.DIUN_TRACKER_URL ?? configFile.logger?.diunTrackerUrl,
		DOCKER_HOSTS: JSON.stringify(configFile.docker?.hosts) ?? "",
		REGCTL_PATH: process.env.REGCTL_PATH ?? configFile.regctl?.path,

		DOCKER_HOST: process.env.DOCKER_HOST,
	},
});

export const chooseDockerEnv = async (selectedHost?: string | undefined) => {
	if (Object.keys(env.DOCKER_HOSTS).length === 0) {
		return;
	}
	if (selectedHost) {
		process.env.DOCKER_HOST = env.DOCKER_HOSTS[selectedHost];
		return;
	}
	if (env.DOCKER_HOST) {
		return;
	}
	const host = await select({
		message: "Select a docker host",
		choices: [
			{
				name: "Local",
				value: "",
			},
			...Object.entries(env.DOCKER_HOSTS).map(([key, value]) => ({
				name: key,
				value: value,
			})),
		],
	});

	process.env.DOCKER_HOST = host;
};
