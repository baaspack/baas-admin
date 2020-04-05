import http from 'http';
import express from 'express';
import session from 'express-session';
import path from 'path';
import connectRedis from 'connect-redis';
import cors from 'cors';

import {
  validationErrors,
  notFound,
  developmentErrors,
  productionErrors,
} from '../handlers/errorHandlers';

export const createSessionParser = (redisClient) => {
  const RedisStore = connectRedis(session);

  const sessionParser = session({
    store: new RedisStore({ client: redisClient }),
    name: '_redis',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // sameSite: true,
    },
  });

  return sessionParser;
};

export const createExpressServer = (passport, sessionParser, router) => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));

  // Serve static files
  app.use(express.static(path.join(__dirname, '../public')));

  // Parse request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Configure sessions
  app.use(sessionParser);

  // Add Passport for auth
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(router);

  app.use(validationErrors);

  app.use(notFound);

  if (app.get('env') === 'development') {
    app.use(developmentErrors);
  }

  app.use(productionErrors);

  const httpServer = http.createServer(app);

  return httpServer;
};
