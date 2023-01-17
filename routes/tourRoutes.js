const express = require('express');
const {
  createTour,
  deleteTour,
  getTour,
  getTours,
  updateTour,
} = require('../controllers/toursControllers');

const router = express.Router();

router.route('/').get(getTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
