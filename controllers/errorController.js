const AppErro = require('../assets/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  // Operational, trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown error : don't leak error details
  } else {
    // 1) log error
    console.error('ERROR', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErro(message, 400);
};

const handleDuplicateFielsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value : ${value}. Please use another value!`;
  return new AppErro(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data.${errors.join(' .')}`;
  return new AppErro(message, 400);
};

const handleJWTExpiredError = () =>
  new AppErro('Your token has expired! Please login again', 401);

const handleJWTError = () =>
  new AppErro('Invalid token, Please log in again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // do not use let error = {...err}; to make a copy of the erro
    // because it will not copy the name
    let error = {
      ...err,
      name: err.name,
    };

    // Handling _id error
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    // handling duplicate field
    if (error.code === 11000) error = handleDuplicateFielsDB(error);
    // handling validation error
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProduction(error, res);
  }
  next();
};
