const express = require('express');

const usersRoute = express.Router();
const userController = require('../controllers/userController');

usersRoute.route('/')
    .get(userController.findAllUsers)
    .post(userController.addUser);
usersRoute.route('/:id')
    .get(userController.findUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = usersRoute;