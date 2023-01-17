const fs = require('fs');

// Read data from local data base
const dbPath = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(`${dbPath}`));

// -----------tours controllers ---------------
exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'succes',
    'requested at': req.requestTime,
    result: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
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

exports.createTour = (req, res) => {
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
  fs.writeFile(`${dbPath}`, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  });
};

exports.updateTour = (req, res) => {
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
  fs.writeFile(`${dbPath}`, JSON.stringify(updatedTours), (err) => {
    if (err) {
      return res.status(404).json({
        status: 'failed',
        message: 'error while trying to update the data',
      });
    }
    res.status(201).json({
      status: 'succes',
      message: `tour : ${id} has been successfully update`,
    });
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  const updatedTours = tours.filter((el) => el._id !== id);

  console.log(updatedTours);

  // Validation
  if (id > tours.length - 1) {
    return res.status(404).json({ message: 'Invalid id' });
  }

  // update data after passing validation
  fs.writeFile(`${dbPath}`, JSON.stringify(updatedTours), (err) => {
    if (err) {
      return res.status(404).json({
        status: 'failed',
        message: 'error while trying to update the data',
      });
    }
    res.status(201).json({
      status: 'succes',
      message: `tour : ${id} has been successfully deleted`,
    });
  });
};