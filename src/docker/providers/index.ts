import standalone from "./standalone";

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

type MultiUpdateResult =
	| {
			status: "done";
			failed: number;
			updated: number;
			scanned: number;
	  }
	| {
			status: "failed";
			reason: string;
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
	updateContainers: (id: string[]) => Promise<MultiUpdateResult>;
	getNewerImage: (image: Image) => Promise<string | null>;
	getContainerId: (name: string) => Promise<string | null>;
	containerType: string;
};

export { standalone, type DockerProvider };
