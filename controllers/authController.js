const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const HandleException = require('./../utils/handleException');
const { promisify } = require('util');
const { findById } = require('../models/tourModel');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id);
  console.log(newUser);
  res.status(201).json({
    status: 'Success',
    token,
    data: {
      data: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // console.log(email);
  // console.log(password);
  if (!email || !password) {
    const message = 'Please enter valid email or password!!';
    return next(new HandleException(message, 400));
  }
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new HandleException('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new HandleException('You are not log in', 401));
  }
  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exists
  const checkUser = await User.findById(decoded.id);

  if (!checkUser) {
    return next(new HandleException(`The user is not exist`, 401));
  }
  //4) check if user changed password

  if (checkUser.changedPasswordAfter(decoded.iat)) {
    return next(new HandleException(`User recently changed password!`, 401));
  }
  req.user = checkUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return next(
        new HandleException(
          'You do not have permission to do this action',
          403,
        ),
      );
    }
    next();
  };
};
exports.forgetPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new HandleException('Can not find this user', 500));
  }

  const resetToken = user.createResetPassword();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Hello world`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token in 10 minutes',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);
    return next(new HandleException('There is have a error'));
  }
};
exports.resetPassword = (req, res, next) => {};
