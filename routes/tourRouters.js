const express = require('express');
const toursRoute = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
toursRoute
  .route('/aliasing')
  .get(tourController.aliasingTours, tourController.findAllTours);
toursRoute.route('/tour-stats').get(tourController.getToursStats);
toursRoute.route('/monthly-plan/:year').get(tourController.MonthlyPlan);
toursRoute
  .route('/')
  .get(authController.protect, tourController.findAllTours)
  .post(tourController.addTour);
toursRoute
  .route('/:id')
  .get(tourController.findTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
module.exports = toursRoute;
