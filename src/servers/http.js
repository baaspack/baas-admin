import http from 'http';
import express from 'express';
import session from 'express-session';
import path from 'path';
import connectRedis from 'connect-redis';
import flash from 'connect-flash';
import methodOverride from 'method-override';

import helpers from '../helpers';
import {
  validationErrors,
  notFound,
  developmentErrors,
  productionErrors,
} from '../handlers/errorHandlers';
import lookForInputInBody from '../handlers/methodOverrideHandler';

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

export const createExpressServer = (passport, sessionParser, router) => {
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

  app.use(router);

  app.get('/', (req, res) => {
    res.render('index', { title: 'index' });
  });

  app.use(validationErrors);

  app.use(notFound);

  if (app.get('env') === 'development') {
    app.use(developmentErrors);
  }

  app.use(productionErrors);

  const httpServer = http.createServer(app);

  return httpServer;
};
