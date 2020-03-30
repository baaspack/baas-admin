import { Router } from 'express';
import authControllerMaker from '../controllers/authController';
import userControllerMaker from '../controllers/userController';

const createAuthRoutes = (User, passport) => {
  const router = Router();
  const authController = authControllerMaker(passport);
  const userController = userControllerMaker(User);

  router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
  });

  router.post('/register',
    userController.register,
    authController.login,
  );

  router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
  });

  router.post('/login', authController.login);

  router.post('/logout', authController.logout);

  return router;
};

export default createAuthRoutes;
