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

// Add new tours to database
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

const PORT = 3000;

app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
