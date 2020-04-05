export const catchErrors = (fn) => (req, res, next) => (
  fn(req, res, next).catch(next)
);

export const notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

export const validationErrors = (err, req, res, next) => {
  if (!err.errors) {
    next(err);
  }

  const messages = err.errors.map(({ type, message }) => `${type}: ${message}`);

  res.status(422).json({ message: messages.join(';') });
};

export const developmentErrors = (err, req, res, _next) => {
  const stack = err.stack || '';
  const stackHighlighted = stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>');

  return res.status(err.status || 500).json({ message: err.message, stack: stackHighlighted });
};

export const productionErrors = (err, req, res, _next) => {
  return res.status(err.status || 500).json({ message: err.message });
};
