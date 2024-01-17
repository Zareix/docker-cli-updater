import { expect, test, describe } from "bun:test";
import { dockerProvider } from "@/docker";
import { TEST_IMAGE_TAG } from "../setup-swarm";

describe("swarm provider", async () => {
	test("provider is swarm", async () => {
		expect(dockerProvider).toBeDefined();
		expect(dockerProvider.isSwarm).toBeTrue();
	});

	test("can list services", async () => {
		const services = await dockerProvider.listContainers();

		expect(services.length).toBeGreaterThan(0);
		expect(services[0].id).toBeDefined();
		expect(services[0].image.tag).toBe(TEST_IMAGE_TAG.split("@")[0]);
		expect(services[0].name).toBe("service_test");
	});

	test("cannot update an up-to-date service", async () => {
		const services = await dockerProvider.listContainers();

		const result = await dockerProvider.updateContainer(services[0].id);

		expect(result.status).toBe("up-to-date");
	});

	test("cannot get newer image of up-to-date service", async () => {
		const services = await dockerProvider.listContainers();

		const result = await dockerProvider.getNewerImage(
			`${services[0].image.tag}@${services[0].image.digest}`,
		);

		expect(result).toBeNull();
	});

	test.todo("can update a service with a newer image (and get the new image)");

	test.todo(
		"can get newer image of a service with a newer image (and get the new image)",
	);
});
