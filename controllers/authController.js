const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utiles/catchAsync');
const AppError = require('../utiles/appError');
const UserModel = require('../models/userModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 400);
  }
  // 2) Check if user exist and password is correct
  /* 
    we use .select('+password') to explicitly select the password
    value from database. beceause we have set the select value to false
    in the userModel. So it 'll not longer show in evry response
  */
  const user = await UserModel.findOne({ email }).select('+password');
  /* 
    1) The correctPassword is defined from userModel.js
    2) We use to send 'Incorrect email or password' as a error response 
      to be vague on the error so the attaquer can't know if it is the email
      or the password is wrong
  */
  // const correct = await UserModel.correctPassword(password, user.password);
  if (!user || !(await UserModel.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  // 3) If every thing is ok, send token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check fo it's there
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('Your are not logged in! Please log in to get access'),
      401
    );
  }
  // 2) Verification token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // 3) Check if user still exists
  const freshUser = await UserModel.findById(decodedToken.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist'),
      401
    );
  }
  // 4) Check if user changed password after the token was issued
  if (freshUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError('User recently changed  password! Please log in again.'),
      401
    );
  }
  // GRANT ACCCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});
