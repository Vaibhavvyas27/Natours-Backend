const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest
const Review = require('./../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')
const Booking = require('./../models/bookingModel')


exports.getAllReviews = factory.getAll(Review)

exports.setTourUserIds = async(req, res, next) => {
    if(!req.body.tour){
        req.body.tour = req.params.tourId
    }
    if(!req.body.user){
        req.body.user = req.user.id
    }
    const booking = await Booking.find({user:req.body.user,tour:req.body.tour})
    if(booking.length == 0){
        return next(new AppError(`You not booked this tour`, 500))
    }
    next()
}

exports.getSingleReview = factory.getSingleOne(Review)

exports.creatReview = factory.createOne(Review)

exports.deleteReview = factory.deleteOne(Review)

exports.updateReview = factory.updateOne(Review)

exports.getMyReviews = catchAsync(async (req, res, next) => {
    console.log('enter')
    const reviews = await Review.find({user:req.params.userId})

    res.status(201).json({
        status: 'Success',
        message: 'succesgull',
        reviews,
    })
})
