// import Docker from "dockerode";
import { afterAll, beforeAll } from "bun:test";
import { pullTestImage } from ".";
import { $ } from "bun";
import chalk from "chalk-template";

const TEST_OLD_IMAGE_TAG =
	"alpine:latest@sha256:b89d9c93e9ed3597455c90a0b88a8bbb5cb7188438f70953fede212a0c4394e0";
const TEST_NEW_IMAGE_TAG = "alpine:latest";

beforeAll(async () => {
	console.log(chalk`{yellow Pulling test images...}`);
	await pullTestImage(TEST_NEW_IMAGE_TAG);
	await pullTestImage(TEST_OLD_IMAGE_TAG);

	console.log(chalk`{yellow Starting test containers...}`);
	await $`docker run -d --name container_test_new ${TEST_NEW_IMAGE_TAG} tail -f /dev/null`.quiet();
	await $`docker run -d --name container_test_old ${TEST_OLD_IMAGE_TAG} tail -f /dev/null`.quiet();
});

afterAll(async () => {
	await $`docker rm -f container_test_new`.quiet();
	await $`docker rm -f container_test_old`.quiet();
});

export { TEST_NEW_IMAGE_TAG, TEST_OLD_IMAGE_TAG };
