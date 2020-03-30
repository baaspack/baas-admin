import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const initializePassport = (User) => {
  const authenticateUser = async (email, password, done) => {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return done(null, false);
    }

    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      return done(null, false);
    }

    return done(null, user);
  };

  const LocalStrategyOptions = {
    usernameField: 'email',
  };

  passport.use(new LocalStrategy(
    LocalStrategyOptions,
    authenticateUser,
  ));

  passport.serializeUser((user, done) => (done(null, user.id)));
  passport.deserializeUser(async (userId, done) => {
    const { id, email } = await User.findByPk(userId);

    return done(null, { id, email });
  });

  return passport;
};

export default initializePassport;
