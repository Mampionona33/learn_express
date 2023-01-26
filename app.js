const express = require('express');

const mongoose = require('mongoose');

const app = express();
const morgan = require('morgan');
const dotenv = require('dotenv');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

/*
  In Node.js, an environment variable is a variable that is set outside of the code and can be accessed within the application. 
  The ".env" file is a file that stores these environment variables in key-value pairs, and is commonly used to store sensitive 
  information such as database credentials or API keys. 
  The variables in the .env file can be accessed using the "dotenv" package, which allows the application to read and use the 
  variables stored in the file. 
  It is important to note that the .env file should not be committed to version control as it contains sensitive information.
 */
dotenv.config({ path: './.env' });

const DB = process.env.DATABASE_URL.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connecting app to database
mongoose.connect(DB).then(() => console.log('DB connection successful !'));

/* ********************************
 ********************MIDDLEWARES */
// morgan is HTTP request logger middleware for node.js
// Only run the morgan middleware if Node environment is set to development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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

module.exports = app;
