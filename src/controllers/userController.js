import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

const UserControllerMaker = (User) => {
  const register = async (req, res, next) => {
    const { email, password } = req.body;

    // TODO: better way to handle password validation??
    //  The @hapi/joi module allows us to apply schemas
    //  to requests. Might be something to look into if this
    //  is bad.
    if (!password || password.length < 3) {
      req.flash('error', 'That password is weak!');
      return res.redirect('back');
    }

    // TODO: validate unique email on the db as well?
    //  it's nice doing it here instead of the model
    //  since this is db agnostic. However, unique indexes
    //  can definitely take care of this.
    const existingUser = await User.findOne({
      attributes: ['id'],
      where: { email },
    });

    // TODO: Research best practices for duplicate usernames / emails.
    //  It might be bad practice to tell a malicious actor that an
    //  an email address is registered with our service.
    if (existingUser) {
      req.flash('error', 'Already registered!');
      return res.redirect('back');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    await User.create({
      email,
      password: passwordHash,
    });

    return next();
  };

  return {
    register,
  };
};

export default UserControllerMaker;
