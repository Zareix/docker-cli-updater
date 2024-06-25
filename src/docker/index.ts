import { $ } from "bun";
import { standalone } from "./providers";

const isSwarm =
	(await $`docker info --format '{{ .Swarm.LocalNodeState }}'`.text()) ===
	"active";

const provider = isSwarm ? null : standalone;
if (!provider) {
	throw new Error("Swarm not supported");
}
const dockerProvider = {
	...provider,
	isSwarm,
};

export { dockerProvider };
