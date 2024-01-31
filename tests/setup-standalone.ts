// import Docker from "dockerode";
import { afterAll, beforeAll } from "bun:test";
import { pullTestImage } from ".";
import { $ } from "bun";
import chalk from "chalk-template";

const TEST_OLD_IMAGE_TAG = "alpine:latest";
const TEST_NEW_IMAGE_TAG = "alpine:latest";

// const getConnection = () =>
// 	new Docker({
// 		host: process.env.DOCKER_HOST,
// 		port: process.env.DOCKER_PORT,
// 	});

beforeAll(async () => {
	// const dockerConnection = getConnection();
	// if (
	// 	await dockerConnection
	// 		.swarmInspect()
	// 		.then(() => true)
	// 		.catch(() => false)
	// ) {
	// 	throw new Error("Docker is in swarm mode (not standalone)");
	// }
	console.log(chalk`{yellow Pulling test images...}`);
	await pullTestImage(TEST_NEW_IMAGE_TAG);
	await pullTestImage(TEST_OLD_IMAGE_TAG);

	console.log(chalk`{yellow Starting test containers...}`);
	await $`docker run -d --name container_test_new ${TEST_NEW_IMAGE_TAG} tail -f /dev/null`;
	await $`docker run -d --name container_test_old ${TEST_OLD_IMAGE_TAG} tail -f /dev/null`;
});

afterAll(async () => {
	await $`docker rm -f container_test_new`;
	await $`docker rm -f container_test_old`;
});

export { TEST_NEW_IMAGE_TAG, TEST_OLD_IMAGE_TAG };
