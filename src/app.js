import http from 'http';
import express from 'express';
import session from 'express-session';
import path from 'path';
import connectRedis from 'connect-redis';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import WebSocket from 'ws';

import helpers from './helpers';
import {
  validationErrors,
  notFound,
  developmentErrors,
  productionErrors,
} from './handlers/errorHandlers';
import lookForInputInBody from './handlers/methodOverrideHandler';

export const createSessionParser = (redisClient) => {
  const RedisStore = connectRedis(session);

  const sessionParser = session({
    store: new RedisStore({ client: redisClient }),
    name: '_redis',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: true,
    },
  });

  return sessionParser;
};

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

export const createExpressServer = (passport, sessionParser, ...routes) => {
  const app = express();

  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Set up the view engine
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  // Parse request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Enable method overriding
  app.use(methodOverride(lookForInputInBody));

  // Configure sessions
  app.use(sessionParser);

  // Add Passport for auth
  app.use(passport.initialize());
  app.use(passport.session());

  // Add flash messages to requests
  app.use(flash());

  // Pass variables to our templates + all requests
  app.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash();
    res.locals.user = req.user || null;
    res.locals.currentPath = req.path;
    next();
  });

  // Add routes
  routes.forEach((route) => {
    app.use(route);
  });

  app.get('/', (req, res) => {
    res.render('index', { title: 'index' });
  });

  // Catch validation errors
  app.use(validationErrors);

  // If that above routes didnt work, we 404 them and forward to error handler
  app.use(notFound);

  // Otherwise this was a really bad error we didn't expect! Shoot eh
  if (app.get('env') === 'development') {
    /* Development Error Handler - Prints stack trace */
    app.use(developmentErrors);
  }

  // production error handler
  app.use(productionErrors);

  const httpServer = http.createServer(app);

  return httpServer;
};
