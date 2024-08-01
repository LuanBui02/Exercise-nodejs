const express = require('express');

const usersRoute = express.Router();
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');

usersRoute.post('/signup', authController.signup);
usersRoute.post('/login', authController.login);
usersRoute.post('/forgotPassword', authController.forgetPassword);
usersRoute.patch('/resetPassword/:token', authController.resetPassword);
usersRoute.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);
usersRoute.patch(
  '/updateUserData',
  authController.protect,
  userController.updateData,
);
usersRoute.delete(
  '/deleteUserData',
  authController.protect,
  userController.deleteUser,
);
usersRoute
  .route('/')
  .get(authController.protect, userController.findAllUsers)
  .post(userController.addUser);
usersRoute
  .route('/:id')
  .get(userController.findUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = usersRoute;
