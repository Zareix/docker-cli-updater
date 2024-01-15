import { expect, test } from "bun:test";
import swarmProvider from "@/docker/providers/swarm";

// TODO Mock env variable or docker connection

test("docker swarm provider can list containers", async () => {
	const services = await swarmProvider.listContainers();

	expect(services.length).toBeGreaterThan(0);
	expect(services[0].id).toBeDefined();
	expect(services[0].image).toBeDefined();
	expect(services[0].name).toBeDefined();
});
