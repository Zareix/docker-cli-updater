import { $ } from "bun";

const pullTestImage = (image: string) => $`docker pull ${image}`;

export { pullTestImage };
