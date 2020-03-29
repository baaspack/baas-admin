import { sequelize } from './models';

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected!!!');
  })
  .catch((err) => {
    console.error('Uh oh', err);
  });
