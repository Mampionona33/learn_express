const express = require('express');
const {
  createUser,
  getUser,
  deleteUser,
  getUsers,
  updateUser,
} = require('../controllers/usersControllers');
const authController = require('../controllers/authController')

// const userRouter = express.Router();
const router = express.Router();
router.post('/signup', authController.signup);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
