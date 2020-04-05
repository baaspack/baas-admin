import backpackControllerMaker from '../controllers/backpackController';
import { catchErrors } from '../handlers/errorHandlers';
import { isLoggedIn } from '../controllers/authController';

const createBackpackRoutes = (router, App, sockets) => {
  const backpackController = backpackControllerMaker(App, sockets);

  router.get('/backpacks', isLoggedIn, catchErrors(backpackController.findAll));
  // router.get('/backpacks/:id', catchErrors(backpackController.find));

  router.post('/backpacks', isLoggedIn, catchErrors(backpackController.createBackpack));
  router.delete('/backpacks/:id', isLoggedIn, catchErrors(backpackController.remove));
};

export default createBackpackRoutes;
