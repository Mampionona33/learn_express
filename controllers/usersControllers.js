const userModel = require('../models/userModel');
const APIFeatures = require('../utiles/apiFeatures');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/appError')

const fs = require('fs');
// Read data from local data base
const dbPath = `${__dirname}/../dev-data/data/users-simple.json`;
const users = JSON.parse(fs.readFileSync(`${dbPath}`));

// --------------users controlers -------------------
exports.getUsers = catchAsync( async(req, res, next) => {
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
  console.log(newId);
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
