import { spawn } from 'child_process';
// import Docker from 'dockerode';

// const socketPath = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
// const docker = new Docker({ socketPath });

export const spinStackUp = (stackName, apiKey) => {
  const stackFilePath = './docker-deployment-files/docker-stack.yml';

  const dockerStackDeploy = spawn('docker',
    [
      'stack',
      'deploy',
      '-c',
      stackFilePath,
      stackName,
    ], {
      env: {
        BPNAME: stackName,
        APIKEY: apiKey,
      },
    });

  dockerStackDeploy.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  dockerStackDeploy.on('error', (err) => {
    console.error('uh oh', err);
  });

  dockerStackDeploy.stdout.pipe(process.stdout);
  dockerStackDeploy.stderr.pipe(process.stderr);
};

export const tearDownStack = (stackName) => {
  const dockerStackRm = spawn('docker',
    [
      'stack',
      'rm',
      stackName,
    ]);

  dockerStackRm.stdout.pipe(process.stdout);
  dockerStackRm.stderr.pipe(process.stderr);
};

export const lol = () => {};
