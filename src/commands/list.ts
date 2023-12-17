import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk-template';
import ora from 'ora';
import { docker } from '../docker';
import { getNewerImage } from '../image';
import { updateService } from '../service';

export const list = async () => {
  const services = await Promise.all(
    (
      await docker.listServices()
    ).map(async (c) => ({
      ...c,
      newImage: await getNewerImage(c.Spec?.TaskTemplate?.ContainerSpec?.Image),
    }))
  );
  services.sort((a, b) => {
    if (a.newImage && !b.newImage) {
      return -1;
    }
    if (!a.newImage && b.newImage) {
      return 1;
    }
    return a.Spec?.Name?.localeCompare(b.Spec?.Name) ?? 0;
  });

  const serviceToUpdate = await select({
    message: 'Select a service to update',
    choices: services.map((c) => ({
      name: chalk`${c.Spec?.Name}{yellow ${
        c.newImage ? ' (Update available)' : ''
      }}`,
      value: c,
      description: `Image: ${
        c.Spec?.TaskTemplate?.ContainerSpec?.Image.split('@')[0]
      }`,
    })),
    loop: false,
  });
  const spinner = ora(
    chalk`Updating service {yellow ${serviceToUpdate.Spec?.Name}}...`
  );
  spinner.start();
  const serviceUpdated = await updateService(serviceToUpdate.ID);
  switch (serviceUpdated) {
    case 'updated':
      spinner.succeed('Service updated!');
      break;
    case 'failed':
      spinner.fail('Failed to update service');
      break;
    case 'up-to-date':
      spinner.info('Service is up to date');
      break;
  }
  const updateAnother = await confirm({
    message: 'Update another service ?',
  });
  if (updateAnother) {
    await list();
  }
};
