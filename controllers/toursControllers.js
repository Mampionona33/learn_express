const TourModel = require('../models/toursModel');
const APIFeatures = require('../assets/apiFeatures');
const catchAsync = require('../assets/catchAsync');
const AppError = require('../assets/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage.price';
  req.query.fields = 'name.price.ratingAverage.duration';
  next();
};

exports.getTours = catchAsync(async (req, res) => {
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
});

exports.getTour = catchAsync(async (req, res, next) => {
  /* 
    the the req.params.id is the id from the tourRoutes
    router.route('/:id').get(getTour)
    this next expression is like :
    TourModel.findOne({_id : req.params.id}) in mongodb
    but we have findById in mongoose whitch is more simple and accurate
  */
  const tour = await TourModel.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with taht ID', 404));
  }
  res.status(200).json({
    status: 'succes',
    data: { tour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with taht ID', 404));
  }

  res.status(200).json({
    status: 'succes',
    result: tour.length,
    data: { tour },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await TourModel.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await TourModel.findByIdAndDelete(req.params.id, req.body);
  if (!tour) {
    return next(new AppError('No tour found with taht ID', 404));
  }
  res.status(204).json({
    status: 'succes',
    result: tour.length,
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  /* 
  $unwind : Deconstructs an array field from the input documents to output 
  a document for each element. Each output document is the input 
  document with the value of the array field replaced by the element.
  */
  const year = req.params.year * 1;
  const plan = await TourModel.aggregate([
    {
      $unwind: '$startDate',
    },
    {
      $match: {
        startDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDate' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      // project is use to hide the filed ex _id :0 => hide _id,
      // _id : 1 <=> show _id
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      // to limit the number of respons
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'succes',
    data: { plan },
  });
});
