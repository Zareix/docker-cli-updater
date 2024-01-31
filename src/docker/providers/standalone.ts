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

const updateContainer: DockerProvider["updateContainer"] = async (
	containerId,
) => {
	// const container = dockerConnection.getContainer(containerId);
	// const containerInfo = await container.inspect();
	const containerInfo =
		await $`docker inspect ${containerId} --format '{{ json . }}'`.json();
	console.log(containerInfo);
	await $`docker pull ${containerInfo.Config.Image}`;
	await $`docker stop ${containerId}`;
	await $`docker rm ${containerId}`;
	// const createdContainer = await dockerConnection.createContainer({
	// 	...containerInfo.Config,
	// 	name: containerInfo.Name,
	// });
	// TODO Create a new container with the same name and options
	const id = await $`
		docker 
	`.text();
	await $`docker start ${id}`;
	return {
		newImage: containerInfo.Config.Image,
		status: "updated",
	};
};

const listContainers: DockerProvider["listContainers"] = async () => {
	const res =
		$`docker ps --no-trunc --format '{{ .ID }}\t{{ .Names }}\t{{ .Image }}'`.lines();
	const containers: Awaited<ReturnType<DockerProvider["listContainers"]>> = [];
	for await (const line of res) {
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
	return newDigest === image.digest ? null : `${image.tag}@${newDigest}`;
};

export default {
	updateContainer,
	listContainers,
	getNewerImage,
	containerType: "container" as const,
} satisfies DockerProvider;
