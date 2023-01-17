const express = require('express');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

/* ********************************
 ********************MIDDLEWARES */
// morgan is HTTP request logger middleware for node.js
app.use(morgan('dev'));

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

// -------- Run server -----------
const PORT = 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
