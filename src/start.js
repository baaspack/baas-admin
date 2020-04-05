import redis from 'redis';
import { Router } from 'express';


import { sequelize } from './models';
import initializePassport from './controllers/passport-setup';
import { createExpressServer, createSessionParser } from './servers/http';
import { createWsServer } from './servers/ws';
import createAuthRoutes from './routes/authRoutes';
import createBackpackRoutes from './routes/backpackRoutes';

const startApp = async () => {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.error('PSQL Connection Issue:', e);
    return;
  }

  const redisClient = redis.createClient({ host: process.env.REDIS_HOSTNAME });

  redisClient.on('error', (err) => { throw err; });

  redisClient.on('connect', () => {
    console.log('Connected to Redis!');
    const router = Router();
    const { user: User, app: App } = sequelize.models;

    const passport = initializePassport(User);

    const sessionParser = createSessionParser(redisClient);
    const server = createExpressServer(passport, sessionParser, router);

    const sockets = createWsServer(server, sessionParser);

    createAuthRoutes(router, User, passport);
    createBackpackRoutes(router, App, sockets);

    server.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  });
};

startApp();
