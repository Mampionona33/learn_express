const TourModel = require('../models/toursModel');

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
  });
};

exports.getTour = (req, res) => {};

exports.createTour = (req, res) => {};

exports.updateTour = (req, res) => {};

exports.deleteTour = (req, res) => {};
