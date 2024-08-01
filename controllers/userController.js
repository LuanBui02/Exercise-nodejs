const catchAsync = require('../utils/catchAsync');
const HandleException = require('../utils/handleException');
const User = require('./../models/userModel');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateData = catchAsync(async (req, res, next) => {
  console.log('hello');
  if (req.body.password || req.body.passwordConfirm) {
    return next(new HandleException('This route is not update password', 404));
  }
  const filterUser = filterObj(req.body, 'name', 'email');

  const updateUser = await User.findByIdAndUpdate(req.user.id, filterUser, {
    new: true,
    runValidator: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
    },
  });
});
exports.deleteUser = async (req, res, next) => {
  const deleteUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'Success',
  });
};
exports.findAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'Success',
    data: users,
  });
});
exports.findUser = (req, res) => {
  res.status(500).json({
    err: 'Error',
    message: 'Function not defined!!!',
  });
};
exports.addUser = (req, res) => {
  res.status(500).json({
    err: 'Error',
    message: 'Function not defined!!!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    err: 'Error',
    message: 'Function not defined!!!',
  });
};
