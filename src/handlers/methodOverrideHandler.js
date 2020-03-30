const lookForInputInBody = (req, _res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const { _method } = req.body;
    delete req.body._method;
    return _method;
  }
};

export default lookForInputInBody;
