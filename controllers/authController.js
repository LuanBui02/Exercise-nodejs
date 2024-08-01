const crypto = require('crypto');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const HandleException = require('./../utils/handleException');
const { promisify } = require('util');
const { findById, findByIdAndUpdate } = require('../models/tourModel');
const sendEmail = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const sentToken = (user, codeStatus, res) => {
  const token = signToken(user._id);
  // console.log(newUser);
  const cookiesOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

  res.cookie('jwt', token, cookiesOptions);

  user.password = undefined;

  res.status(codeStatus).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  sentToken(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email);
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
  sentToken(user, 200, res);
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
  // console.log(user);

  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `This is your resetToken: ${resetToken}`;
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
exports.resetPassword = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  //1) get user base on the token
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetExpires: { $gt: Date.now() },
    passwordResetToken: hashToken,
  });
  //2) if the token is not expired, there is have user and set a new password
  if (!user) {
    return next(new HandleException('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;

  await user.save();
  //3) Update changPasswordAt
  //4) Log user in, sned JWT
  sentToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get users from collection\
  if (!req.body.password)
    return next(new HandleException('Enter your new password', 400));
  const user = await User.findById(req.user.id).select('+password');
  //2) check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new HandleException('Your password is not same with the current', 404),
    );
  }
  //3) if so update password\
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  //4)login user in send JWT
  sentToken(user, 200, res);
});
