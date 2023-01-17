const express = require('express');
const {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
  idValidation,
} = require('../controllers/toursControllers');

const router = express.Router();

// using the idValidation middleware
// to check if the id params is valid
// before run to the next middleware
// this middleware is note available in
// the user ressource beceause we put it
// here not in the main application "app"
router.param('id', idValidation);

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
