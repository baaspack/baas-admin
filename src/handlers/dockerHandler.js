import Docker from 'dockerode';
import { exec } from 'child_process';

const socketPath = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
const docker = new Docker({ socketPath });

export const spinStackUp = (stackName) => {
  const stackFilePath = './docker-deployment-files/docker-stack.yml';

  exec(`BPNAME=${stackName} docker stack deploy -c ${stackFilePath} ${stackName}`, (err, stdout, stderr) => {
    console.log(stdout);

    console.error(stderr);

    if (err) {
      console.log(err);
    }
  });
};

export const lol = () => {};
