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

type Image = {
	tag: string;
	digest: string;
	platform: string;
};

type Container = {
	id: string;
	name: string;
	image: Image;
};

type DockerProvider = {
	listContainers: () => Promise<Container[]>;
	updateContainer: (id: string) => Promise<UpdateResult>;
	getNewerImage: (image: Image) => Promise<string | null>;
	containerType: string;
};

export { swarm, standalone, type DockerProvider };
