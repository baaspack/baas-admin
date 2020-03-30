import path from 'path';
import express from 'express';
import flash from 'connect-flash';

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

  // Add Passport for auth
  server.use(passport.initialize());
  server.use(passport.session());

  // Add flash messages to requests
  server.use(flash());

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
