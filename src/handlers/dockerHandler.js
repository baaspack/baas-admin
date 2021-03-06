import { spawn } from 'child_process';
// import Docker from 'dockerode';

// const socketPath = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
// const docker = new Docker({ socketPath });

const createAction = (backpackName, message) => (
  JSON.stringify({
    type: 'TERMINAL_MESSAGE_RECEIVE',
    payload: {
      backpackName,
      message,
    },
  })
);

const sendMessagesThroughWebsockets = (backpackName, command, socket, goodbyeMessage) => {
  command.on('exit', (code) => {
    socket.send(createAction(backpackName, `Command exited with code ${code}\n`));

    if (code === 0 && goodbyeMessage) {
      socket.send(createAction(backpackName, `${goodbyeMessage}\n`));
    }
  });

  command.on('error', (buffer) => {
    socket.send(createAction(backpackName, buffer.toString()));
  });

  command.stdout.on('data', (buffer) => {
    socket.send(createAction(backpackName, buffer.toString()));
  });

  command.stderr.on('data', (buffer) => {
    socket.send(createAction(backpackName, buffer.toString()));
  });
};

export const spinStackUp = (stackName, apiKey, userSocket) => {
  const domain = process.env.DOMAIN || 'localhost';
  const stackFileType = domain === 'localhost' ? 'local' : 'stack';
  const stackFilePath = `./docker-deployment-files/docker-backpack-${stackFileType}.yml`;

  const dockerStackDeploy = spawn('docker',
    [
      'stack',
      'deploy',
      '-c',
      stackFilePath,
      stackName,
    ], {
      env: {
        DOMAIN: domain,
        BPNAME: stackName,
        APIKEY: apiKey,
      },
    });

  if (userSocket) {
    const goodbyeMessage = `your backend URL is ${stackName}-be.${domain}!\n`;

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

export const updateNginx = (stackName, userSocket) => {
  const dockerServiceUpdateCommand = spawn('docker',
    [
      'service',
      'update',
      '--force',
      '--replicas',
      '1',
      `${stackName}_nginx`,
    ]);

  dockerServiceUpdateCommand.on('exit', (code) => {
  });

  dockerServiceUpdateCommand.on('error', (buffer) => {
    console.error(buffer.toString());
  });

  dockerServiceUpdateCommand.stdout.on('data', (buffer) => {
    console.log(buffer.toString());
  });

  dockerServiceUpdateCommand.stderr.on('data', (buffer) => {
    console.error(buffer.toString());
  });

  // Not sending any messages back at the moment
};
