class AppErro extends Error {
  constructor(message, statusCode) {
    // message is the only parameter that the error accep
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppErro;
