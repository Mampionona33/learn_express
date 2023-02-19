const userModel = require('../models/userModel');
const APIFeatures = require('../assets/apiFeatures');
const catchAsync = require('../assets/catchAsync');
const AppError = require('../assets/appError');

const fs = require('fs');
const UserModel = require('../models/userModel');
// Read data from local data base
const dbPath = `${__dirname}/../dev-data/data/users-simple.json`;
const users = JSON.parse(fs.readFileSync(`${dbPath}`));

const filtredObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// --------------users controlers -------------------
exports.getUsers = catchAsync(async (req, res) => {
  const users = await userModel.find();
  res.status(200).json({
    status: 'succes',
    result: users.length,
    data: { users: users },
  });
});

exports.createUser = (req, res) => {
  /* 
      in a real data base the id will be create automaticaly
      but in this facke data , we will create a id
    */
  const newId = users[users.length - 1]._id + 1;
  const newUser = ({ _id: newId }, req.body);
  console.log(newUser);
  users.push(newUser);
  // use writeFile not writeFileSync inside callback function
  fs.writeFile(`${dbPath}`, JSON.stringify(users), () => {
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  });
};

// Middleware to give user to update his data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use updateMyPassword'
      )
    );
  }

  // 2) Filtered out unwanted fields names there are not allowed to be updated
  const filteredBody = filtredObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

// To handle request user request delete account
/* 
  Use this methode to not delete the user from database
  set it only to inactive so for the past the user can 
  reactive it
*/
exports.deleteMe = catchAsync(async (req, res, next) => {
  await UserModel.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {
  // to create optional parameter add ? after params like : /api/v1/users/:id?
  // params are variables from url
  const id = req.params.id * 1;

  if (id > users.length - 1) {
    return res.status(404).json({ message: 'Invalid id' });
  }

  const user = users.find((el) => el._id === id);
  res.status(200).json({
    status: 'succes',
    data: { user: user },
  });
};

exports.updateUser = (req, res) => {
  const id = req.params.id * 1;
  const selectedUser = users.filter((el) => el._id === id);
  const updatedUsers = users.filter((el) => el._id !== id);

  const updeatedTour = selectedUser.map((el) => ({ ...el, ...req.body }));

  updatedUsers.push(updeatedTour[0]);

  console.log(updatedUsers);

  // Validation
  if (id > users.length - 1 || selectedUser.length <= 0) {
    console.log(id, users.length);
    return res.status(404).json({ message: 'Invalid id' });
  }

  // update data after passing validation
  fs.writeFile(`${dbPath}`, JSON.stringify(updatedUsers), (err) => {
    if (err) {
      return res.status(404).json({
        status: 'failed',
        message: 'error while trying to update the data',
      });
    }
    res.status(201).json({
      status: 'succes',
      message: `User : ${id} has been successfully update`,
    });
  });
};

exports.deleteUser = (req, res) => {
  const id = req.params.id * 1;
  const updatedUser = users.filter((el) => el._id !== id);

  console.log(updatedUser);

  // Validation
  if (id > users.length - 1) {
    return res.status(404).json({ message: 'Invalid id' });
  }

  // update data after passing validation
  fs.writeFile(`${dbPath}`, JSON.stringify(updatedUser), (err) => {
    if (err) {
      return res.status(404).json({
        status: 'failed',
        message: 'error while trying to update the data',
      });
    }
    res.status(201).json({
      status: 'succes',
      message: `user : ${id} has been successfully deleted`,
    });
  });
};
