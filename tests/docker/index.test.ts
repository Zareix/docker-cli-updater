import { expect, test, describe } from "bun:test";
import { dockerConnection } from "@/docker";

test("docker connection", async () => {
	expect(dockerConnection).toBeDefined();

	const inspection = await dockerConnection.info();
	expect(inspection).toBeDefined();
});

describe("swarm provider", async () => {
	// TODO Mock env variable or docker connection
	const { dockerProvider } = await import("@/docker");

	test("provider is swarm", async () => {
		expect(dockerProvider).toBeDefined();
		expect(dockerProvider.isSwarm).toBeTrue();
	});

	test("can list containers", async () => {
		const containers = await dockerProvider.listContainers();

		expect(containers.length).toBeGreaterThan(0);
		expect(containers[0].id).toBeDefined();
		expect(containers[0].image).toBeDefined();
		expect(containers[0].name).toBeDefined();
	});
});

describe("standalone provider", async () => {
	// TODO Mock env variable or docker connection
	const { dockerProvider } = await import("@/docker");

	test("provider is standalone", async () => {
		expect(dockerProvider).toBeDefined();
		expect(dockerProvider.isSwarm).toBeFalse();
	});

	test("can list containers", async () => {
		const containers = await dockerProvider.listContainers();

		expect(containers.length).toBeGreaterThan(0);
		expect(containers[0].id).toBeDefined();
		expect(containers[0].image).toBeDefined();
		expect(containers[0].name).toBeDefined();
	});
});
