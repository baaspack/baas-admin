import WebSocket from 'ws';
import httpProxy from 'http-proxy';

export const createWsServer = (httpServer, sessionParser) => {
  const wsConnections = new Map();
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });


  httpServer.on('upgrade', (req, socket, head) => {
    sessionParser(req, {}, () => {
      if (!req.session.passport || !req.session.passport.user) {
        socket.destroy();
        return;
      }

      const [rootResource, stackName] = req.url.slice(1).split('/');

      if (rootResource === 'backpacks' && stackName) {
        const stackUrl = `http://${stackName}_backpack:4000`;
        console.log(`connecting to ${stackUrl}`);

        const proxy = httpProxy.createProxyServer({
          target: stackUrl,
          ws: true,
        });

        proxy.ws(req, socket, head);

        proxy.on('open', () => {
          console.log(`connected to ${stackName}!`);
        });

        proxy.on('error', (err) => {
          console.error(err);
        });
      } else {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      }
    });
  });

  wss.on('connection', (ws, req) => {
    const userId = req.session.passport.user;
    wsConnections.set(userId, ws);

    ws.on('message', (msg) => {
      console.log(`Received msg ${msg} from ${userId}`);
    });

    ws.on('close', () => {
      console.log(`see ya ${userId}`);
      wsConnections.delete(userId);
    });
  });

  return wsConnections;
};

export default createWsServer;
