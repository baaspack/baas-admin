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

  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }

    req.flash('error', 'Please sign in.');
    return res.redirect('/login');
  };

  return {
    login,
    logout,
    isLoggedIn,
  };
};

export default AuthControllerMaker;
