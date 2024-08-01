const HandleException = require('./../utils/handleException');
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new HandleException(message, 400);
};
const handleDuplicate = (err) => {
  const message = `The email is duplicate. Please try another email`;

  return new HandleException(message, 400);
};

const handleValidate = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new HandleException(message, 400);
};
const handleTokenError = (err) => {
  const message = `Invalid signature`;

  return new HandleException(message, 400);
};
const handleTokenExpired = (err) => {
  const message = `Your token is expired, please login again!!`;

  return new HandleException(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  if (err.isOptional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'Error',
      message: 'Something is wrong!!!',
    });
    console.log(err);
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    let error = err;
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicate(error);
    if (err.name === 'JsonWebTokenError') error = handleTokenError(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpired(error);
    if (err.name === 'ValidationError') error = handleValidate(error);
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicate(error);
    if (err.name === 'ValidationError') error = handleValidate(error);
    if (err.name === 'JsonWebTokenError') error = handleTokenError(error);
    if (err.name === 'TokenExpiredError') error = handleTokenExpired(error);
    sendErrorPro(error, res);
  }
};
