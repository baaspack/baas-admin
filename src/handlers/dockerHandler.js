import { spawn } from 'child_process';
// import Docker from 'dockerode';

// const socketPath = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
// const docker = new Docker({ socketPath });

const sendMessagesThroughWebsockets = (stack, command, socket, goodbyeMessage) => {
  command.on('exit', (code) => {
    const message = `Command exited with code ${code}\n`;
    socket.send(JSON.stringify({ stack, message, type: 'exit' }));
    if (code === 0 && goodbyeMessage) {
      socket.send(JSON.stringify({ stack, message: `${goodbyeMessage}\n`, type: 'exit' }));
    }
  });

  command.on('error', (buffer) => {
    socket.send(JSON.stringify({ stack, message: buffer.toString(), type: 'err' }));
  });

  command.stdout.on('data', (buffer) => {
    socket.send(JSON.stringify({ stack, message: buffer.toString(), type: 'msg' }));
  });

  command.stderr.on('data', (buffer) => {
    socket.send(JSON.stringify({ stack, message: buffer.toString(), type: 'err' }));
  });
};

export const spinStackUp = (stackName, apiKey, userSocket) => {
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

  if (userSocket) {
    const goodbyeMessage = `see you at ${stackName}.localhost!\n`;

    sendMessagesThroughWebsockets(
      stackName,
      dockerStackDeploy,
      userSocket,
      goodbyeMessage,
    );
  }
};

export const tearDownStack = (stackName, userSocket) => {
  const dockerStackRm = spawn('docker',
    [
      'stack',
      'rm',
      stackName,
    ]);

  if (userSocket) {
    const goodbyeMessage = `${stackName} has been removed!\n`;

    sendMessagesThroughWebsockets(
      stackName,
      dockerStackRm,
      userSocket,
      goodbyeMessage,
    );
  }
};
