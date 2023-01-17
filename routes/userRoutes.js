const express = require('express');
const {
  createUser,
  getUser,
  deleteUser,
  getUsers,
  updateUser,
} = require('../controllers/usersControllers');

// const userRouter = express.Router();
const router = express.Router();
router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
