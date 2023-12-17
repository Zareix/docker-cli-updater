import { Service } from 'dockerode';
import { docker } from './docker';
import { getNewerImage } from './image';

type UpdateStatus = 'updated' | 'failed' | 'up-to-date';

const updateService = async (
  serviceId: Service['ID']
): Promise<UpdateStatus> => {
  const service = await docker.getService(serviceId).inspect();

  const currentImage = service.Spec?.TaskTemplate?.ContainerSpec?.Image;
  let newImage;
  try {
    newImage = await getNewerImage(currentImage);
  } catch (e) {
    return 'failed';
  }
  if (!newImage) {
    return 'up-to-date';
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
    return 'failed';
  }

  return 'updated';
};

export { updateService };
