import { type DockerProvider } from "@/docker/providers";
import { readableStreamToText } from "bun";

const dockerConnection: any = {};

const listServices: DockerProvider["listContainers"] = async () => {
	return (await dockerConnection.listServices()).map((s) => ({
		id: s.ID,
		name: s.Spec?.Name ?? "Unknown",
		image: {
			tag:
				s.Spec?.TaskTemplate?.ContainerSpec?.Image.split("@")[0] ?? "Unknown",
			digest:
				s.Spec?.TaskTemplate?.ContainerSpec?.Image.split("@")[1] ?? "Unknown",
			platform:
				s.Spec?.TaskTemplate?.ContainerSpec?.Platform?.Architecture ??
				"Unknown",
		},
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

const getNewerImage: DockerProvider["getNewerImage"] = async (image) => {
	const proc = Bun.spawn([
		process.env.REGCTL_BIN ?? "regctl",
		"image",
		"digest",
		image.tag,
	]);
	const response = await readableStreamToText(proc.stdout);
	const latestImageDigest = response.trim();
	// const imageInfo = await dockerConnection.getImage(image).inspect();
	// const latestImageDigest =  imageInfo.RepoDigests[0].split("@")[1] // TODO Check if this is the latest image (or only local)

	return image.digest !== latestImageDigest
		? `${image.tag}@${latestImageDigest}`
		: null;
};

export default {
	updateContainer: updateService,
	updateContainers: async () => {
		return {
			status: "failed",
			reason: "Not implemented",
		};
	},
	listContainers: listServices,
	getNewerImage,
	containerType: "service" as const,
} satisfies DockerProvider;
