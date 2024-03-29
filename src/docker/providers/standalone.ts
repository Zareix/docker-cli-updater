import { type DockerProvider } from "@/docker/providers";
import { $ } from "bun";

const getImageInfo = async (imageTag: string) => {
	const res =
		await $`docker image inspect ${imageTag} --format '{{ .Id }}\t{{ .Os }}/{{ .Architecture }}'`.text();
	const [digest, platform] = res.split("\t");
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
	console.log(output.toString());

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

const getNewerImage: DockerProvider["getNewerImage"] = async (image) => {
	const newDigest =
		await $`./regctl image inspect --platform ${image.platform} ${image.tag} --format '{{ .Digest }}'`.text();
	console.log(image.tag, newDigest);

	return newDigest === image.digest ? null : `${image.tag}@${newDigest}`;
};

export default {
	updateContainers,
	updateContainer: async (containerId) => await updateContainers([containerId]),
	listContainers,
	getNewerImage,
	containerType: "container" as const,
} satisfies DockerProvider;
