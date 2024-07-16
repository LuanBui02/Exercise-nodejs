const express = require('express');

const usersRoute = express.Router();
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');

usersRoute.post('/signup', authController.signup);
usersRoute.post('/login', authController.login);
usersRoute
  .route('/')
  .get(userController.findAllUsers)
  .post(userController.addUser);
usersRoute
  .route('/:id')
  .get(userController.findUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = usersRoute;
