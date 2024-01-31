import { $ } from "bun";
import { standalone, swarm } from "./providers";

const isSwarm =
	(await $`docker info --format '{{ .Swarm.LocalNodeState }}'`.text()) ===
	"active";

const provider = isSwarm ? swarm : standalone;
const dockerProvider = {
	...provider,
	isSwarm,
};

export { dockerProvider };
