const express = require('express');
const {
  createUser,
  getUser,
  deleteUser,
  getUsers,
  updateUser,
  updateMe,
  deleteMe,
} = require('../controllers/usersControllers');
const {
  signup,
  login,
  forgoPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authController');

// const userRouter = express.Router();
const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgoPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.patch('/deleteMe', protect, deleteMe);

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
