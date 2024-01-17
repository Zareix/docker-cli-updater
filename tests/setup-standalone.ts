import Docker from "dockerode";
import { afterAll, beforeAll } from "bun:test";
import { pullTestImage } from ".";

const TEST_OLD_IMAGE_TAG = "alpine:latest";
const TEST_NEW_IMAGE_TAG = "alpine:latest";

const getConnection = () =>
	new Docker({
		host: process.env.DOCKER_HOST,
		port: process.env.DOCKER_PORT,
	});

beforeAll(async () => {
	const dockerConnection = getConnection();
	if (
		await dockerConnection
			.swarmInspect()
			.then(() => true)
			.catch(() => false)
	) {
		throw new Error("Docker is in swarm mode (not standalone)");
	}
	await pullTestImage(TEST_NEW_IMAGE_TAG);
	await pullTestImage(TEST_OLD_IMAGE_TAG);
	await new Promise((resolve, reject) => {
		dockerConnection.createContainer(
			{
				name: "container_test_new",
				Image: TEST_NEW_IMAGE_TAG,
				Cmd: ["tail", "-f", "/dev/null"],
				AttachStdin: false,
				AttachStdout: false,
				AttachStderr: false,
			},
			(err, container) => {
				if (err) {
					reject(err);
				}
				container?.start((err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			},
		);
	});
	await new Promise((resolve, reject) => {
		dockerConnection.createContainer(
			{
				name: "container_test_old",
				Image: TEST_OLD_IMAGE_TAG,
				Cmd: ["tail", "-f", "/dev/null"],
				AttachStdin: false,
				AttachStdout: false,
				AttachStderr: false,
			},
			(err, container) => {
				if (err) {
					reject(err);
				}
				container?.start((err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			},
		);
	});
});

afterAll(async () => {
	const dockerConnection = getConnection();
	const containers = (await dockerConnection.listContainers()).filter(
		(x) =>
			x.Names.includes("/container_test_new") ||
			x.Names.includes("/container_test_old"),
	);
	for (const container of containers) {
		await dockerConnection.getContainer(container.Id).remove({ force: true });
	}
});

export { TEST_NEW_IMAGE_TAG, TEST_OLD_IMAGE_TAG };
