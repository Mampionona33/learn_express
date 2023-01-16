const express = require('express');
const fs = require('fs');
const app = express();

// expres.json() is a middleware to modify the incomming request
// If we do not use it, so the data from the methode post will be undefined
app.use(express.json());

// Read data from local data base
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// GET all tours from database
app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'succes', result: tours.length, data: { tours: tours } });
});

// GET one tour from database
app.get('/api/v1/tours/:id', (req, res) => {
  // to create optional parameter add ? after params like : /api/v1/tours/:id?
  // params are variables from url
  const id = req.params.id * 1;

  if (id > tours.length - 1) {
    console.log(id, tours.length);
    return res.status(404).json({ message: 'Invalid id' });
  }

  const tour = tours.find((el) => el._id === id);
  res.status(200).json({
    status: 'succes',
    data: { tour: tour },
  });
});

// Create new tours to database
app.post('/api/v1/tours', (req, res) => {
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
});

// Update tour
app.patch('/api/v1/tours/:id', (req, res) => {
  const id = req.params.id * 1;
  const selectedTour = tours.filter((el) => el._id === id);
  const updatedTours = tours.filter((el) => el._id !== id);

  const updeatedTour = selectedTour.map((el) => {
    return Object.assign({}, el, req.body);
  });
  updatedTours.push(updeatedTour[0]);
  console.log(updatedTours);

  // Validation
  if (id > tours.length - 1) {
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
});

const PORT = 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
