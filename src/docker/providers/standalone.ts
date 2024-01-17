import { type DockerProvider } from "@/docker/providers";
import { dockerConnection } from "@/docker";

const updateContainer: DockerProvider["updateContainer"] = async (
	containerId,
) => {
	const container = dockerConnection.getContainer(containerId);
	const containerInfo = await container.inspect();

	const newerImage = await getNewerImage({
		tag: containerInfo.Config.Image,
		digest: containerInfo.Image,
	});

	if (newerImage) {
		console.log("updating", containerInfo.Config.Image, "to", newerImage);
		try {
			await container.update({
				Image: newerImage,
			});
		} catch (e) {
			return {
				status: "failed",
				reason: `Could not run container update: ${e}`,
			};
		}
		return { status: "updated", newImage: newerImage };
	}

	return { status: "up-to-date" };
};

const listContainers: DockerProvider["listContainers"] = async () =>
	Promise.all(
		(await dockerConnection.listContainers()).map(async (c) => ({
			id: c.Id,
			name: c.Names[0].replace(/^\//, ""),
			image: {
				tag: c.Image,
				digest: (await dockerConnection.getImage(c.Image).inspect()).Id,
			},
		})),
	);

const getNewerImage: DockerProvider["getNewerImage"] = async (image) => {
	const latestImageDigest = (
		await dockerConnection.getImage(image.tag).inspect()
	).Id; // TODO This is the local image, not the latest image

	return image.digest !== latestImageDigest
		? `${image.tag}@${latestImageDigest}`
		: null;
};

export default {
	updateContainer,
	listContainers,
	getNewerImage,
	containerType: "container" as const,
} satisfies DockerProvider;
