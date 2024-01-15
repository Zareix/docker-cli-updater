import { DockerProvider } from ".";
import { dockerConnection } from "..";

const updateContainer: DockerProvider["updateContainer"] = async (
	containerId,
) => {
	return { status: "up-to-date" };
};

const listContainers: DockerProvider["listContainers"] = async () => {
	return (await dockerConnection.listContainers()).map((c) => ({
		id: c.Id,
		name: c.Names[0],
		image: c.Image,
	}));
};

export default {
	updateContainer,
	listContainers,
} satisfies DockerProvider;
