const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest
const Review = require('./../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')



exports.getAllReviews = factory.getAll(Review)

exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour){
        req.body.tour = req.params.tourId
    }
    if(!req.body.user){
        req.body.user = req.user.id
    }
    next()
}

exports.getSingleReview = factory.getSingleOne(Review)

exports.creatReview = factory.createOne(Review)

exports.deleteReview = factory.deleteOne(Review)

exports.updateReview = factory.updateOne(Review)
