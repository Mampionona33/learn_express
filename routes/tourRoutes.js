const express = require('express');
const {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/toursControllers');
const { protect, restrictedTo } = require('../controllers/authController');

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

router.route('/tour-stats').get(getTourStats);

// Pipline unwinding and projecting
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').get(protect, getTours).post(createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  // User must be authentificated and have admin or lead-guide roles
  // to perfome a tour delete action
  .delete(protect, restrictedTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
