const express = require('express');

const app = express();
const dotenv = require('dotenv');
const AppErro = require('./utiles/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

dotenv.config({ path: './.env' });

// expres.json() is a middleware to modify the incomming request
// If we do not use it, so the data from the methode post will be undefined
app.use(express.json());

// serving static file frome server
app.get('/overview.html', (req, res) => {
  res.sendFile(`${__dirname}/public/overview.html`);
});

/* 
  1) Express middleware are inline executting function process between the request
     and the final response;
     Request ----> middleware_1(next()) ----> middleware_2(next()) ----> middleware_3(next()) ----> Response
  2) To add a middleware to the express middleware stack, use the function "use" 
     exemple : app.use(express.json()), in this exemple express.json() is a middleware
  3) A midlare function alredy get three parameters : request, response and next.
     next is a  function with must be called at the end of every middleware function
     it is use to pass the respons to the next middleware. If you forgot to add it
     to the end of your middleware, your request will stay on pending.
*/

// One exemple of middleware
app.use((req, res, next) => {
  console.log('hello from middleware 👋');
  next();
});

// another example of of middleware
// we call it on the request getTourss
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ------------- Tours routes ----------------
const toursBasedUrl = '/api/v1/tours';
const userBasedUrl = '/api/v1/users';
app.use(toursBasedUrl, tourRouter);
app.use(userBasedUrl, userRouter);

// Handling unhandling routes
/* 
  If the req, res cycle reach this point
  that means, it pass through previous routes
*/
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;

  /* 
    if next function receve some argument, express
    know that it is an error. And it will skip throug
    all other middleware stack and 
  */
  next(new AppErro(`Can't find ${req.originalUrl}`, 404));
});

// HANDLING ERROR GLOBAL MIDDLEWARE
/*
  By specifing four parameter, express know that
  this is a error handling middleware
*/
app.use(globalErrorHandler);

module.exports = app;
