import standalone from "./standalone";
import swarm from "./swarm";

type UpdateResult =
	| {
			status: "updated";
			newImage: string;
	  }
	| {
			status: "failed";
			reason: string;
	  }
	| {
			status: "up-to-date";
	  };

type Container = {
	id: string;
	name: string;
	image: {
		tag: string;
		digest: string;
	};
};

type DockerProvider = {
	listContainers: () => Promise<Container[]>;
	updateContainer: (id: string) => Promise<UpdateResult>;
	getNewerImage: (image: string) => Promise<string | null>;
	containerType: string;
};

export { swarm, standalone, type DockerProvider };
