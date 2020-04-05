const AuthControllerMaker = (passport) => {
  const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) { return next(err); }

      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) { return next(loginErr); }

        return res.json({ message: 'Signed in!' });
      });
    })(req, res, next);
  };

  const logout = (req, res) => {
    req.logout();

    return res.json({ message: 'See ya!' });
  };

  return {
    login,
    logout,
  };
};

export const endpointForIsLoggedIn = (req, res) => {
  const isLoggedIn = req.isAuthenticated();

  return res.send({ isLoggedIn });
};

export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
};

export const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.status(403).json({ message: 'Sign out to see this' });
};

export default AuthControllerMaker;
