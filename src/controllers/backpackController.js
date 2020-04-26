import { spinStackUp, tearDownStack } from '../handlers/dockerHandler';

const backpackControllerMaker = (App, sockets) => {
  const findAll = async (req, res) => {
    const userId = req.user.id;

    const apps = await App.findAll({
      where: { userId },
    });

    return res.json({ message: '', backpacks: apps });
  };

  const find = async (req, res) => {
    const { name } = req.params;
    const userId = req.user.id;

    const backpack = await App.findOne({
      attributes: ['id', 'name'],
      where: { name, userId },
    });

    if (backpack) {
      return res.json({ message: '', backpack });
    }

    return res.status(404).json({ message: 'No backpack found!' });
  };

  const createBackpack = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    const userSocket = sockets.get(userId);

    // TODO: Add a prefix as a namespace
    // to avoid name collisions.
    const app = await App.create({ name, userId });

    spinStackUp(app.name, app.api_key, userSocket);

    return res.json({ message: `Created ${app.name}`, backpack: app });
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

      const userSocket = sockets.get(userId);

      tearDownStack(app.name, userSocket);
      return res.json({ message: 'Deleted!', id: app.id, name: app.name });
    }

    return res.status(404).json({ message: 'No app found to delete' });
  };

  return {
    findAll,
    find,
    createBackpack,
    remove,
  };
};

export default backpackControllerMaker;
