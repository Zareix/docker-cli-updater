import { Service } from "dockerode";
import { docker } from ".";
import { getNewerImage } from "./image";

type UpdateResult =
	| {
			status: "updated";
			newImage: string;
	  }
	| {
			status: "failed";
			reason: string;
	  }
	| {
			status: "up-to-date";
	  };

const updateService = async (
	serviceId: Service["ID"],
): Promise<UpdateResult> => {
	const service = await docker.getService(serviceId).inspect();

	const currentImage = service.Spec?.TaskTemplate?.ContainerSpec?.Image;
	let newImage;
	try {
		newImage = await getNewerImage(currentImage);
	} catch (e) {
		return { status: "failed", reason: "Could not find newer image" };
	}
	if (!newImage) {
		return { status: "up-to-date" };
	}

	try {
		await docker.getService(serviceId).update({
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

export { updateService };
