const fs = require('fs');
// import { Tour } from './../models/tourModel';
const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const { match } = require('assert');

exports.aliasingTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,duration';
  next();
};
exports.findAllTours = async (req, res) => {
  try {
    const features = new ApiFeatures(Tour.find(), req.query)
      .filter()
      .fieldsLimit()
      .sort()
      .pagination();
    const tour = await features.query;

    res.status(200).json({
      status: 'success!',
      Time: req.requestTime,
      length: tour.length,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      err: 'Fail',
      message: err.message,
    });
  }
};
exports.findTour = async (req, res) => {
  try {
    const tourFindById = await Tour.findById(req.params.id);
    console.log(req.params.id);
    res.status(200).json({
      status: 'success!',
      data: {
        tourFindById,
      },
    });
  } catch (err) {
    res.status(404).json({
      err: 'Fail',
      message: err,
    });
  }
};
exports.addTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success!!!',
      data: {
        newTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'ERROR!!',
      message: err.message,
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const updateData = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: updateData,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'ERROR!!',
      message: err.message,
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const tourDelete = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'ERROR!!',
      message: err.message,
    });
  }
};

exports.getToursStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: {
      //     _id: { $ne: 'EASY' },
      //   },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {}
};

exports.MonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err.message,
    });
  }
};
