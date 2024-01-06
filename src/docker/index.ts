import Docker from "dockerode";

const docker = new Docker({ host: process.env.DOCKER_HOST, port: 2375 });

export { docker };
