const express = require('express');
const {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
  idValidation,
  createTourValidation,
} = require('../controllers/toursControllers');

const router = express.Router();

// using the idValidation middleware
// to check if the id params is valid
// before run to the next middleware
// this middleware is note available in
// the user ressource beceause we put it
// here not in the main application "app"
router.param('id', idValidation);

// Create checkBody = createTourValidation
//  middleware witch
// check if the body of request to create
// new tour contains name and description
// if not send back 400 (bad request)
// add the checkBody middleware to the post request
// like so : post(checkBody, createTour);

router.route('/').get(getTours).post(createTourValidation, createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
