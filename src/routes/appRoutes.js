import { Router } from 'express';
import appControllerMaker from '../controllers/appController';
import { catchErrors } from '../handlers/errorHandlers';
import { isLoggedIn } from '../controllers/authController';

const createAppRoutes = (App) => {
  const router = Router();
  const appController = appControllerMaker(App);

  router.get('/apps', isLoggedIn, catchErrors(appController.findAll));
  // router.get('/apps/:id', catchErrors(appController.find));
  router.get('/apps/add', isLoggedIn, appController.addApp);

  router.post('/apps/add', isLoggedIn, catchErrors(appController.createApp));
  router.delete('/apps/:id', isLoggedIn, catchErrors(appController.remove));

  return router;
};

export default createAppRoutes;
