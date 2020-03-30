import { Router } from 'express';
import appControllerMaker from '../controllers/appController';
import { catchErrors } from '../handlers/errorHandlers';

const createAppRoutes = (App) => {
  const router = Router();
  const appController = appControllerMaker(App);

  router.get('/apps', catchErrors(appController.findAll));
  // router.get('/apps/:id', catchErrors(appController.find));
  router.get('/apps/add', appController.addApp);

  router.post('/apps/add', catchErrors(appController.createApp));
  // router.delete('/apps/:id', catchErrors(appController.remove));

  return router;
};

export default createAppRoutes;
