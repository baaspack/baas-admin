import { sequelize } from './models';
import initializePassport from './controllers/passport-setup';
import createExpressServer from './app';
import createAuthRoutes from './routes/authRoutes';

const startApp = async () => {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.error('PSQL Connection Issue:', e);
    return;
  }

  const { User } = sequelize.models;

  const passport = initializePassport(User);
  const authRoutes = createAuthRoutes(User, passport);

  const server = createExpressServer(passport, authRoutes);

  server.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
  });
};

startApp();
