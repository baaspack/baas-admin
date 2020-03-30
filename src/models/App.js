import crypto from 'crypto';

const generateApiToken = async () => {
  const buffer = crypto.randomBytes(24);

  return buffer.toString('base64');
};

const createAppModel = (sequelize, DataTypes) => {
  const App = sequelize.define('app', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    api_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    hooks: {
      beforeValidate: async (app, _options) => {
        if (app.isNewRecord) {
          app.api_key = await generateApiToken();
        }
      },
    },
  });

  return App;
};

export default createAppModel;
