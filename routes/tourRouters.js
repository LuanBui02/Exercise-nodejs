const express = require('express');

const toursRoute = express.Router();
const tourController = require('../controllers/tourController');
toursRoute.param('id', tourController.checkID);
toursRoute.route('/')
    .get(tourController.findAllTours)
    .post(tourController.checkBody, tourController.addTour);
toursRoute.route('/:id')
    .get(tourController.findTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = toursRoute;