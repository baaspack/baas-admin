import { Router } from 'express';
import authControllerMaker, { isNotLoggedIn } from '../controllers/authController';
import userControllerMaker from '../controllers/userController';


const createAuthRoutes = (User, passport) => {
  const router = Router();
  const authController = authControllerMaker(passport);
  const userController = userControllerMaker(User);

  router.get('/register', isNotLoggedIn, (req, res) => {
    res.render('auth/register', { title: 'Register' });
  });

  router.post('/register',
    isNotLoggedIn,
    userController.register,
    authController.login,
  );

  router.get('/login', isNotLoggedIn, (req, res) => {
    res.render('auth/login', { title: 'Login' });
  });

  router.post('/login', isNotLoggedIn, authController.login);

  router.post('/logout', authController.logout);

  return router;
};

export default createAuthRoutes;
