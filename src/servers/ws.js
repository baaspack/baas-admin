import WebSocket from 'ws';

export const createWsServer = (httpServer, sessionParser) => {
  const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    console.log('Parsing session from request...');

    sessionParser(req, {}, () => {
      if (!req.session.passport || !req.session.passport.user) {
        socket.destroy();
        return;
      }

      console.log('Parsed the sesh!');

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.emit('connection', ws, req);
      });
    });
  });

  wss.on('connection', (ws, req) => {
    const userId = req.session.user.id;

    ws.on('message', (msg) => {
      console.log(`Received msg ${msg} from ${userId}`);
    });
  });

  return wss;
};

export default createWsServer;
