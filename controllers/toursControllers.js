const TourModel = require('../models/toursModel');
const APIFeatures = require('../utiles/apiFeatures');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage.price';
  req.query.fields = 'name.price.ratingAverage.duration';
  next();
};

exports.getTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    // the chaining is work because we use the return this inside
    // every methode in the APIFeatures class
    const features = new APIFeatures(TourModel.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

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

exports.deleteTour = async (req, res) => {
  try {
    const tour = await TourModel.findByIdAndDelete(req.params.id, req.body);
    res.status(204).json({
      status: 'succes',
      result: tour.length,
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await TourModel.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // setting _id to null for calculate all tours without grouping
          // _id: null,
          // we can group the result by fileds by replacing the _id
          // for exemple by duration
          // _id: '$duration',
          _id: { $toUpper: '$imageCover' },
          numTours: { $sum: 1 }, // Add 1 in numTours for each tour
          sumDuration: { $sum: '$duration' },
          avgRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        // As a pipline the data is now the data from the group
        // not the data from the tourModel input
        $sort: { avgPrice: 1 },
      },
      {
        // $ne means not equal to so the Image 3 field well be exculd
        // to the respons
        // The _id is the id from the $group
        $match: { _id: { $ne: 'IMAGE 3' } },
      },
    ]);
    res.status(200).json({
      status: 'succes',
      data: { stats },
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error,
    });
  }
};
