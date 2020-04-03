import { spinStackUp, tearDownStack } from '../handlers/dockerHandler';

const appControllerMaker = (App) => {
  const findAll = async (req, res) => {
    const userId = req.user.id;

    const apps = await App.findAll({
      where: { userId },
    });

    res.render('apps/index', { title: 'Apps', apps });
  };

  const find = (req, res) => {
    // TODO Implement
  };

  const addApp = (req, res) => {
    res.render('apps/add', { title: 'Add a new app' });
  };

  const createApp = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    // TODO: Create a blacklist for invalid names,
    // strip out punctuation and other symbols

    // TODO: Add a prefix as a namespace
    // to avoid name collisions.
    const app = await App.create({ name, userId });

    spinStackUp(app.name, app.api_key);

    req.flash('success', `Created ${app.name}!`);
    res.redirect('/apps');
  };

  const remove = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const app = await App.findOne({
      where: { id, userId },
    });

    if (app) {
      await App.destroy({
        where: { id, userId },
      });

      tearDownStack(app.name);
      req.flash('success', 'Deleted!');
    } else {
      req.flash('error', 'No app found to delete');
    }

    res.redirect('/apps');
  };

  return {
    findAll,
    find,
    addApp,
    createApp,
    remove,
  };
};

export default appControllerMaker;
