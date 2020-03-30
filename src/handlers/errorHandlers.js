export const catchErrors = (fn) => (req, res, next) => (
  fn(req, res, next).catch(next)
);

export const notFound = (req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
};

export const developmentErrors = (err, req, res, _next) => {
  err.stack = err.stack || '';

  const errorDetails = {
    message: err.message,
    status: err.status,
    stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };

  res.status(err.status || 500);
  res.format({
    'text/html': () => res.render('error', errorDetails),
    'application/json': () => res.json(errorDetails),
  });
};

export const productionErrors = (err, req, res, _next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
};
