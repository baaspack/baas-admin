import WebSocket from 'ws';

export const createWsServer = (httpServer, sessionParser) => {
  const wsConnections = new Map();
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    sessionParser(req, {}, () => {
      if (!req.session.passport || !req.session.passport.user) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
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
