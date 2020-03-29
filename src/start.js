import { sequelize } from './models';
import createExpressServer from './app';

const startApp = async () => {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.error('PSQL Connection Issue:', e);
    return;
  }

  const server = createExpressServer();

  server.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`);
  });
};

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected!!!');
  })
  .catch((err) => {
    console.error('Uh oh', err);
  });

startApp();
