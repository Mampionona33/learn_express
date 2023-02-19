const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../assets/catchAsync');
const AppError = require('../assets/appError');
const UserModel = require('../models/userModel');
const sendEmail = require('../assets/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookiesOptions = {
    // convert day to millisecond = 90 days * 24 hours * 60 min * 60 sec * 1000 milsec
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    // only send cookies on only encripted connection = https
    // secure: true,

    // The cookies can note be access or modified by the browser any way
    // For preventing the cross side scripting attack
    // The cookies is receved by the browser and then stored, it will automaticly
    // resent in every request
    httpOnly: true,
  };

  // Only set secure to true on production
  if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

  // Sending cookies
  res.cookie('jwt', token, cookiesOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    ...req.body,
    // name: req.body.name,
    // email: req.body.email,
    // password: req.body.password,
    // passwordConfirm: req.body.passwordConfirm,
    // passwordChangeAt: req.body.passwordChangeAt,
  });

  createSendToken(newUser, 201, res);

  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
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
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  // 3) If every thing is ok, send token to the client
  createSendToken(user, 201, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
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

exports.forgoPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();

  //  validateBeforeSave: false is use to desactivate all validators in the schema
  await user.save({ validateBeforeSave: false });
  // 3) Send it to user's email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/susers/resetPassword/${resetToken}`;

  const message = `Forgot your password ? Submit a PATCH request with your new password and
  passwordConfirm to : ${resetUrl}.\nIf  you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (vaid for 10min)',
      message,
    });
    res.status(200).json({
      status: 'sucess',
      message: 'Token sent to email',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an error sending the email. Tryagain later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user  based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has epired'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordA proprety for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 201, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

// update the password for loged user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await UserModel.findById(req.user.id).select('+password');
  // 2) Check if POSTed curren password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // User.findByIdAndUpdate will not work as intended!
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 201, res);
});
