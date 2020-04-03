const AuthControllerMaker = (passport) => {
  const login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'No go.',
    successRedirect: '/',
    successFlash: 'Logged in!',
  });

  const logout = (req, res) => {
    req.logout();
    req.flash('success', 'See ya!');
    res.redirect('/');
  };

  return {
    login,
    logout,
  };
};

export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('error', 'Please sign in.');
  return res.redirect('/login');
};

export const isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }

  req.flash('error', 'Already signed in.');
  return res.redirect('/');
};

export default AuthControllerMaker;
