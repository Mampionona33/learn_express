const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');

/* ********************************
 ********************MIDDLEWARES */
// morgan is HTTP request logger middleware for node.js
app.use(morgan('dev'));

// expres.json() is a middleware to modify the incomming request
// If we do not use it, so the data from the methode post will be undefined
app.use(express.json());

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

// Read data from local data base
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/* ********************************
 **************ROUTE CONTROLLERS */
const getTours = (req, res) => {
  res.status(200).json({
    status: 'succes',
    'requested at': req.requestTime,
    result: tours.length,
    data: { tours: tours },
  });
};

const getTour = (req, res) => {
  // to create optional parameter add ? after params like : /api/v1/tours/:id?
  // params are variables from url
  const id = req.params.id * 1;

  if (id > tours.length - 1) {
    return res.status(404).json({ message: 'Invalid id' });
  }

  const tour = tours.find((el) => el._id === id);
  res.status(200).json({
    status: 'succes',
    data: { tour: tour },
  });
};

const createTour = (req, res) => {
  /* 
    in a real data base the id will be create automaticaly
    but in this facke data , we will create a id
  */
  const newId = tours[tours.length - 1]._id + 1;
  console.log(newId);
  const newTour = Object.assign({ _id: newId }, req.body);
  console.log(newTour);
  tours.push(newTour);
  // use writeFile not writeFileSync inside callback function
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  const id = req.params.id * 1;
  const selectedTour = tours.filter((el) => el._id === id);
  const updatedTours = tours.filter((el) => el._id !== id);

  const updeatedTour = selectedTour.map((el) => {
    return Object.assign({}, el, req.body);
  });
  updatedTours.push(updeatedTour[0]);

  console.log(selectedTour);

  // Validation
  if (id > tours.length - 1 || selectedTour.length <= 0) {
    console.log(id, tours.length);
    return res.status(404).json({ message: 'Invalid id' });
  }

  // update data after passing validation
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(201).json({
        status: 'succes',
        message: `tour : ${id} has been successfully update`,
      });
      if (err) {
        return res.status(404).json({
          status: 'failed',
          message: 'error while trying to update the data',
        });
      }
    }
  );
};

const deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const updatedTours = tours.filter((el) => el._id !== id);

  console.log(updatedTours);

  // Validation
  if (id > tours.length - 1) {
    return res.status(404).json({ message: 'Invalid id' });
  }

  // update data after passing validation
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(201).json({
        status: 'succes',
        message: `tour : ${id} has been successfully deleted`,
      });
      if (err) {
        return res.status(404).json({
          status: 'failed',
          message: 'error while trying to update the data',
        });
      }
    }
  );
};

/* *******************************
 *************************ROUTES */
// GET all tours from database
app.get('/api/v1/tours', getTours);

// GET one tour from database
app.get('/api/v1/tours/:id', getTour);

// Create new tours to database
app.post('/api/v1/tours', createTour);

// Update tour
app.patch('/api/v1/tours/:id', updateTour);

// Delete tour
app.delete('/api/v1/tours/:id', deleteTour);

const PORT = 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
