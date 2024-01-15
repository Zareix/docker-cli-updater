import { expect, test } from "bun:test";
import { getNewerImage } from "@/docker/image";

const getLatestImageFromDockerHub = async () =>
	fetch(
		"https://registry.hub.docker.com/v2/repositories/library/nginx/tags/latest",
	)
		.then((r) => r.json() as Promise<{ digest: string }>)
		.then((r) => `nginx:latest@${r.digest}`);

test("no newer image return for latest one", async () => {
	const imageWithDigest = await getLatestImageFromDockerHub();
	console.log(imageWithDigest);

	const newerImage = await getNewerImage(imageWithDigest);

	expect(newerImage).toBeNull();
});

test("newer image return for old one", async () => {
	const imageWithDigest =
		"nginx:latest@sha256:0f3f08e4b66b3b25e5f608678cdd0d0c5e8afb4aafaae09cb9d7fa57c6e0e99d";

	const newerImage = await getNewerImage(imageWithDigest);

	expect(newerImage).toBeDefined();
});
