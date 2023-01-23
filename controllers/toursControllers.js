const fs = require('fs');
// Read data from local data base
const dbPath = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(`${dbPath}`));

// -----------tours controllers ---------------
// create a validation middleware
// It will use before running the route in tourRoutes
// to check if the param id is valids.
// So if the param is valid we don't need to check it
// for the rest of the middleware stack
exports.idValidation = (req, res, next, val) => {
  if (val > tours.length - 1) {
    return res.status(404).json({ message: 'Invalid id' });
  }
  next();
};

exports.createTourValidation = (req, res, next) => {
  if (req.body.name === undefined || req.body.description === undefined) {
    return res
      .status(400)
      .json({ message: 'bad request. name and description are required' });
  }
  next();
};

exports.getTours = (req, res) => {
  res.status(200).json({
    status: 'succes',
    'requested at': req.requestTime,
    result: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
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
  // console.log(newId);
  const newTour = { _id: newId, ...req.body };
  console.log(newTour);
  tours.push(newTour);
  // use writeFile not writeFileSync inside callback function
  fs.writeFile(`${dbPath}`, JSON.stringify(tours), () => {
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

  const updeatedTour = selectedTour.map((el) => ({ ...el, ...req.body }));
  updatedTours.push(updeatedTour[0]);

  console.log(selectedTour);

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
  const { id } = req.params;
  const updatedTours = tours.filter((el) => el._id !== id);
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
