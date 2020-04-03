import redis from 'redis';

import { sequelize } from './models';
import initializePassport from './controllers/passport-setup';
import { createExpressServer, createSessionParser, createWsServer } from './app';
import createAuthRoutes from './routes/authRoutes';
import createAppRoutes from './routes/appRoutes';

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
    const { user: User, app: App } = sequelize.models;

    const passport = initializePassport(User);
    const authRoutes = createAuthRoutes(User, passport);
    const appRoutes = createAppRoutes(App);

    const sessionParser = createSessionParser(redisClient);

    const server = createExpressServer(passport, sessionParser, authRoutes, appRoutes);
    const wss = createWsServer(server, sessionParser);

    server.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  });
};

startApp();
