import { expect, test, describe } from "bun:test";
import { dockerProvider } from "@/docker";
import { TEST_NEW_IMAGE_TAG, TEST_OLD_IMAGE_TAG } from "../setup-standalone";

describe("standalone provider", async () => {
	test("provider is standalone", async () => {
		expect(dockerProvider).toBeDefined();
		expect(dockerProvider.isSwarm).toBeFalse();
	});

	test("can list containers", async () => {
		const containers = await dockerProvider.listContainers();

		expect(containers.length).toBeGreaterThan(0);
		expect(containers).toContainEqual({
			id: expect.any(String),
			name: "container_test_new",
			image: {
				tag: TEST_NEW_IMAGE_TAG,
				digest: expect.any(String),
				platform: expect.any(String),
			},
		});
		expect(containers).toContainEqual({
			id: expect.any(String),
			name: "container_test_old",
			image: {
				tag: TEST_OLD_IMAGE_TAG,
				digest: expect.any(String),
				platform: expect.any(String),
			},
		});
	});

	test.todo("cannot update an up-to-date container", async () => {
		const containers = await dockerProvider.listContainers();

		const result = await dockerProvider.updateContainer(containers[0].id);

		expect(result.status).toBe("up-to-date");
	});

	test("cannot get newer image of up-to-date container", async () => {
		const containers = await dockerProvider.listContainers();

		const result = await dockerProvider.getNewerImage(containers[0].image);

		expect(result).toBeNull();
	});

	test.todo("can update a container with an old image (and get the new image)");

	test.todo("can get newer image of a container with an old image");
});
