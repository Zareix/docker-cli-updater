import { expect, test } from "bun:test";
import standaloneProvider from "@/docker/providers/standalone";

// TODO Mock env variable or docker connection

test("docker standalone provider can list containers", async () => {
	const containers = await standaloneProvider.listContainers();

	expect(containers.length).toBeGreaterThan(0);
	expect(containers[0].id).toBeDefined();
	expect(containers[0].image).toBeDefined();
	expect(containers[0].name).toBeDefined();
});
