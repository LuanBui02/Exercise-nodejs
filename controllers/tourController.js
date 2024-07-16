const fs = require('fs');
// import { Tour } from './../models/tourModel';
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/apiFeatures');
const { match } = require('assert');
const HandleException = require('../utils/handleException');

exports.aliasingTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,duration';
  next();
};
exports.findAllTours = catchAsync(async (req, res, next) => {
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
});
exports.findTour = catchAsync(async (req, res, next) => {
  const tourFindById = await Tour.findById(req.params.id);
  console.log(req.params.id);

  if (!tourFindById) {
    return next(new HandleException('Not found item', 404));
  }
  res.status(200).json({
    status: 'success!',
    data: {
      tourFindById,
    },
  });
});
exports.addTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success!!!',
    data: {
      newTour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const updateData = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateData) {
    return next(new HandleException('Not found item', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: updateData,
    },
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tourDelete = await Tour.findByIdAndDelete(req.params.id);

  if (!tourDelete) {
    return next(new HandleException('Not found item', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

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
      // {
      //   $sort: { avgPrice: 1 },
      // },
      // {
      //   $match: {
      //     _id: { $ne: 'easy' },
      //   },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      error: 'Fail',
      message: err.message,
    });
  }
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
      {
        $group: {
          _id: { $month: '$startDates' },
          tours: { $push: '$name' },
          numTours: { $sum: 1 },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $sort: {
          numTours: 1,
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
