import { readableStreamToText } from 'bun';

const getNewerImage = async (image: string) => {
  const [imageTag, currentImageDigest] = image.split('@');

  const proc = Bun.spawn([
    process.env.REGCTL_BIN ?? 'regctl',
    'image',
    'digest',
    imageTag,
  ]);
  const response = await readableStreamToText(proc.stdout);
  const latestImageDigest = response.trim();

  return currentImageDigest !== latestImageDigest
    ? `${imageTag}@${latestImageDigest}`
    : null;
};

export { getNewerImage };
