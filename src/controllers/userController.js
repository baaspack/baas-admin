import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 10;

const UserControllerMaker = (User) => {
  const register = async (req, res) => {
    const { email, password } = req.body;

    // TODO: better way to handle password validation??
    //  The @hapi/joi module allows us to apply schemas
    //  to requests. Might be something to look into if this
    //  is bad.
    if (!password || password.length < 3) {
      return res.status(422).send({ message: 'That password is weak!' });
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
      return res.status(422).send({ message: 'That email already exists!' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      email,
      password: passwordHash,
    });

    return res.send({ id: user.id, message: 'Welcome, please sign in!' });
  };

  return {
    register,
  };
};

export default UserControllerMaker;
