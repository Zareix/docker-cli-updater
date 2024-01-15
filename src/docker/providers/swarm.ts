import { DockerProvider } from ".";
import { dockerConnection } from "..";
import { getNewerImage } from "../image";

const listServices: DockerProvider["listContainers"] = async () => {
	return (await dockerConnection.listServices()).map((s) => ({
		id: s.ID,
		name: s.Spec?.Name ?? "Unknown",
		image: s.Spec?.TaskTemplate?.ContainerSpec?.Image ?? "Unknown",
	}));
};

const updateService: DockerProvider["updateContainer"] = async (serviceId) => {
	const service = await dockerConnection.getService(serviceId).inspect();

	const currentImage = service.Spec?.TaskTemplate?.ContainerSpec?.Image;
	let newImage: string | null;
	try {
		newImage = await getNewerImage(currentImage);
	} catch (e) {
		return { status: "failed", reason: "Could not find newer image" };
	}
	if (!newImage) {
		return { status: "up-to-date" };
	}

	try {
		await dockerConnection.getService(serviceId).update({
			...service.Spec,
			TaskTemplate: {
				...service.Spec.TaskTemplate,
				ContainerSpec: {
					...service.Spec.TaskTemplate.ContainerSpec,
					Image: newImage,
				},
			},
			version: service.Version.Index,
		});
	} catch (e) {
		return { status: "failed", reason: "Could not run service update" };
	}

	return { status: "updated", newImage };
};

export default {
	updateContainer: updateService,
	listContainers: listServices,
} satisfies DockerProvider;
