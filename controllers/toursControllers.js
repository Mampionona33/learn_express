const TourModel = require('../models/toursModel');

exports.getTours = async (req, res) => {
  try {
    // BUIL QUERY
    // Create copy of the query
    // 1A) Filtering
    const queryObj = { ...req.query };

    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    /* 
      On using mongoose.set({ strictQuery: false }); in server.js
      We must delete each element from excludeFields in queryObj
      to ignore params that are in excludeFields
    */
    excludeFields.forEach((el) => delete queryObj[el]);
    console.log(excludeFields);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // replace gte|gt|lte|lt by mongodb operators $gte|$gt|$lte|$lt
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    /* 
      Prepare query before using it to be 
      able execute sorting it before the
      await function is runing
    */
    console.log(JSON.parse(queryStr));
    let query = TourModel.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split('.').join(' ');
      query = query.sort(sortBy);
    } else {
      // default sorting if user does not give sorting
      query = query.sort('-createAt');
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split('.').join(' ');
      query = query.select(fields);
    } else {
      // This is use to remove the __v variable in the fields
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=10&limit=10 <=> query.skip(10).limit(10) <=> 1-10 page1 ; 11-20 page 2; ...
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      // if number of document that we skiped is greater than
      // the document alredy exist,that means the page does not exist
      const numTours = await TourModel.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // EXECUTE QUERY
    const tours = await query;

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
