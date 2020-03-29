import { Sequelize, DataTypes } from 'sequelize';
import userMaker from './User';
import appMaker from './App';

const sequelize = new Sequelize(
  process.env.DB_DBNAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
    dialect: 'postgres',
  },
);

// Create models which will be saved under sequelize.models
const User = userMaker(sequelize, DataTypes);
const App = appMaker(sequelize, DataTypes);

// Create associations
App.belongsTo(User, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

// Create tables if they don't exist
sequelize.sync({ force: false });

export { sequelize };
