import authControllerMaker, { isNotLoggedIn, endpointForIsLoggedIn } from '../controllers/authController';
import userControllerMaker from '../controllers/userController';

const createAuthRoutes = (router, User, passport) => {
  const authController = authControllerMaker(passport);
  const userController = userControllerMaker(User);

  router.post('/register', userController.register);

  router.get('/isLoggedIn', endpointForIsLoggedIn);

  router.post('/login', isNotLoggedIn, authController.login);

  router.post('/logout', authController.logout);
};

export default createAuthRoutes;
