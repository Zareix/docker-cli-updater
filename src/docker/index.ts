import Docker from "dockerode";
import { standalone, swarm } from "./providers";

const dockerConnection = new Docker({
	host: process.env.DOCKER_HOST,
	port: process.env.DOCKER_PORT,
});

const isSwarm = await dockerConnection
	.swarmInspect()
	.then(() => true)
	.catch(() => false);

const provider = isSwarm ? swarm : standalone;
const dockerProvider = {
	...provider,
	isSwarm,
};

export { dockerConnection, dockerProvider };
