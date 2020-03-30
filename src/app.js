import path from 'path';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import helpers from './helpers';

const createExpressServer = (passport, ...routes) => {
  const server = express();

  // Serve static files
  server.use(express.static(path.join(__dirname, 'public')));

  // Set up the view engine
  server.set('views', path.join(__dirname, 'views'));
  server.set('view engine', 'pug');

  // Parse request bodies
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Configure sessions
  server.use(session({
    // store: new RedisStore({ client: redisClient }),
    // name: '_redis',
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

  return server;
};

export default createExpressServer;
