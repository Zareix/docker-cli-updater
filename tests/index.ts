import { dockerConnection } from "@/docker";

const pullTestImage = (image: string) =>
	new Promise<void>((resolve, reject) => {
		// biome-ignore lint/suspicious/noExplicitAny: dockerode typings are incorrect
		dockerConnection.pull(image, (err: any, stream: any) => {
			dockerConnection.modem.followProgress(stream, onFinished, () => {});
			// biome-ignore lint/suspicious/noExplicitAny: dockerode typings are incorrect
			function onFinished(err: any) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			}
		});
	});

export { pullTestImage };
