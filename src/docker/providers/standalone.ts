import type { DockerProvider } from "@/docker/providers";
import { $, env } from "bun";

const getImageInfo = async (imageTag: string) => {
	const res =
		await $`docker image inspect ${imageTag} --format '{{ .Id }}:::{{ .Os }}/{{ .Architecture }}'`.text();
	const [digest, platform] = res.split(":::");
	return {
		tag: imageTag,
		digest: digest,
		platform: platform.replace("\n", ""),
	};
};

const updateContainers: DockerProvider["updateContainers"] = async (
	containerIds,
) => {
	const containersToUpdate = (await listContainers())
		.filter((c) => containerIds.includes(c.id))
		.map((c) => c.name)
		.join(" ");

	// TODO: Bind config.json
	const { stderr: output } =
		await $`docker run --name docker-updater_watchtower --rm -v /var/run/docker.sock:/var/run/docker.sock containrrr/watchtower -l JSON --cleanup --run-once $(echo $CONTAINERS)`
			.env({
				...process.env,
				CONTAINERS: containersToUpdate,
			})
			.quiet();

	for (const line of output.toString().split("\n")) {
		try {
			const parsed = JSON.parse(line);
			if (!("msg" in parsed) || parsed.msg !== "Session done") {
				continue;
			}
			return {
				status: "done",
				failed: parsed.Failed,
				updated: parsed.Updated,
				scanned: parsed.Scanned,
			};
		} catch (e) {}
	}
	return {
		status: "failed",
		reason: "Watchtower exited unexpectedly",
	};
};

const updateContainer: DockerProvider["updateContainer"] = async (
	containerId,
) => {
	const updateRes = await updateContainers([containerId]);
	switch (updateRes.status) {
		case "done":
			return updateRes.updated > 0
				? {
						status: "updated",
						newImage: "unknown",
					}
				: {
						status: "up-to-date",
					};
		case "failed":
			return {
				status: "failed",
				reason: updateRes.reason,
			};
	}
};

const listContainers: DockerProvider["listContainers"] = async () => {
	const lines =
		$`docker ps --no-trunc --format '{{ .ID }}\t{{ .Names }}\t{{ .Image }}'`.lines();
	const containers: Awaited<ReturnType<DockerProvider["listContainers"]>> = [];
	for await (const line of lines) {
		if (line === "") continue;
		const [id, names, imageTag] = line.split("\t");
		containers.push({
			id,
			name: names.split(",")[0],
			image: await getImageInfo(imageTag),
		});
	}
	return containers;
};

const getContainerId: DockerProvider["getContainerId"] = async (
	name: string,
) => {
	const lines =
		$`docker ps --no-trunc --format '{{ .ID }}' --filter name=${name}`.lines();
	for await (const line of lines) {
		if (line === "") continue;
		return line;
	}
	return null;
};

const getNewerImage: DockerProvider["getNewerImage"] = async (image) => {
	if (!env.REGCTL_PATH) {
		return null;
	}
	try {
		const newDigest =
			await $`${env.REGCTL_PATH} image inspect --platform ${image.platform} ${image.tag} --format '{{ .Digest }}'`.text();
		return newDigest === image.digest ? null : `${image.tag}@${newDigest}`;
	} catch {
		return null;
	}
};

export default {
	updateContainers,
	updateContainer,
	listContainers,
	getNewerImage,
	getContainerId,
	containerType: "container" as const,
} satisfies DockerProvider;
