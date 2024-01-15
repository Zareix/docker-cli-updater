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
	image: string;
};

export type DockerProvider = {
	listContainers: () => Promise<Container[]>;
	updateContainer: (id: string) => Promise<UpdateResult>;
};

export { swarm, standalone };
