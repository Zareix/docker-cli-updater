import { type DockerProvider } from "@/docker/providers";
import { dockerConnection } from "@/docker";

const updateContainer: DockerProvider["updateContainer"] = async (
	containerId,
) => {
	const container = dockerConnection.getContainer(containerId);
	const containerInfo = await container.inspect();

	const newerImage = await getNewerImage(
		`${containerInfo.Config.Image}@${containerInfo.Image}`,
	);

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

const getNewerImage: DockerProvider["getNewerImage"] = async (
	imageWithDigest,
) => {
	const [imageTag, currentImageDigest] = imageWithDigest.split("@");
	const latestImageDigest = (
		await dockerConnection.getImage(imageTag).inspect()
	).Id; // TODO Check if this is the latest image (or only local)

	return currentImageDigest !== latestImageDigest
		? `${imageTag}@${latestImageDigest}`
		: null;
};

export default {
	updateContainer,
	listContainers,
	getNewerImage,
	containerType: "container" as const,
} satisfies DockerProvider;
