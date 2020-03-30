import path from 'path';
import express from 'express';
import session from 'express-session';
import connectRedis from 'connect-redis';
import flash from 'connect-flash';
import methodOverride from 'method-override';

import helpers from './helpers';
import { notFound, developmentErrors, productionErrors } from './handlers/errorHandlers';
import lookForInputInBody from './handlers/methodOverrideHandler';

const createExpressServer = (passport, redisClient, ...routes) => {
  const RedisStore = connectRedis(session);
  const server = express();

  // Serve static files
  server.use(express.static(path.join(__dirname, 'public')));

  // Set up the view engine
  server.set('views', path.join(__dirname, 'views'));
  server.set('view engine', 'pug');

  // Parse request bodies
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Enable method overriding
  server.use(methodOverride(lookForInputInBody));

  // Configure sessions
  server.use(session({
    store: new RedisStore({ client: redisClient }),
    name: '_redis',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: true,
    },
  }));

  // Add Passport for auth
  server.use(passport.initialize());
  server.use(passport.session());

  // Add flash messages to requests
  server.use(flash());

  // Pass variables to our templates + all requests
  server.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash();
    res.locals.user = req.user || null;
    res.locals.currentPath = req.path;
    next();
  });

  // Add routes
  routes.forEach((route) => {
    server.use(route);
  });

  server.get('/', (req, res) => {
    res.render('index', { title: 'index' });
  });

  // If that above routes didnt work, we 404 them and forward to error handler
  server.use(notFound);

  // Otherwise this was a really bad error we didn't expect! Shoot eh
  if (server.get('env') === 'development') {
    /* Development Error Handler - Prints stack trace */
    server.use(developmentErrors);
  }

  // production error handler
  server.use(productionErrors);

  return server;
};

export default createExpressServer;
