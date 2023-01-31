const express = require('express');
const {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
  aliasTopTours,
} = require('../controllers/toursControllers');

const router = express.Router();

// Create checkBody = createTourValidation
//  middleware witch
// check if the body of request to create
// new tour contains name and description
// if not send back 400 (bad request)
// add the checkBody middleware to the post request
// like so : post(checkBody, createTour);

// to make top five tours
router.route('/top-5-cheaps').get(aliasTopTours, getTours);

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
