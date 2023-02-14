const express = require('express');
const {
  createUser,
  getUser,
  deleteUser,
  getUsers,
  updateUser,
} = require('../controllers/usersControllers');
const { signup, login } = require('../controllers/authController');

// const userRouter = express.Router();
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
