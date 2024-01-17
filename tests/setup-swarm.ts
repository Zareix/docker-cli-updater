import Docker from "dockerode";
import { afterAll, beforeAll } from "bun:test";
import { pullTestImage } from ".";

const TEST_IMAGE_TAG =
	"alpine:latest@sha256:51b67269f354137895d43f3b3d810bfacd3945438e94dc5ac55fdac340352f48"; // TODO Find a way to get this dynamically
// TODO Separate old and new image tags

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
			.then(() => false)
			.catch(() => true)
	) {
		throw new Error("Docker is not in swarm mode");
	}
	await pullTestImage(TEST_IMAGE_TAG);

	await dockerConnection.createService({
		Name: "service_test",
		TaskTemplate: {
			ContainerSpec: {
				Image: TEST_IMAGE_TAG,
				Command: ["tail", "-f", "/dev/null"],
			},
		},
	});
});

afterAll(async () => {
	const dockerConnection = getConnection();
	await dockerConnection.getService("service_test").remove();
});

export { TEST_IMAGE_TAG };
