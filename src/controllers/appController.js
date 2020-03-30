const appControllerMaker = (App) => {
  const findAll = async (req, res) => {
    const apps = await App.findAll();

    res.render('apps/index', { title: 'Apps', apps });
  };

  const find = (req, res) => {

  };

  const addApp = (req, res) => {
    res.render('apps/add', { title: 'Add a new app' });
  };

  const createApp = async (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    const app = await App.create({ name, userId });

    req.flash('success', `Created ${app.name}!`);
    res.redirect('/apps');
  };

  const remove = async (req, res) => {
    const { id } = req.params;

    const numOfAppsDeleted = await App.destroy({
      where: { id },
    });

    if (numOfAppsDeleted > 0) {
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
