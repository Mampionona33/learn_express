const TourModel = require('../models/toursModel');

exports.getTours = async (req, res) => {
  try {
    const tours = await TourModel.find();
    res.status(200).json({
      status: 'succes',
      result: tours.length,
      data: { tours },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    /* 
      the the req.params.id is the id from the tourRoutes
      router.route('/:id').get(getTour)
      this next expression is like :
      TourModel.findOne({_id : req.params.id}) in mongodb
      but we have findById in mongoose whitch is more simple and accurate
    */
    const tour = await TourModel.findById(req.params.id);
    res.status(200).json({
      status: 'succes',
      result: tour.length,
      data: { tour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'succes',
      result: tour.length,
      data: { tour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await TourModel.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.deleteTour = (req, res) => {};
