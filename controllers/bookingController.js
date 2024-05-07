const AppError = require('../utils/appError')
const Tour = require('./../models/tourModel')
const Booking = require('./../models/bookingModel')
const APIFeatures = require('./../utils/apiFeatures')  // ApiFeature class Instance 
const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest
const factory = require('./handlerFactory')
const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY)



exports.getCheckoutSessions = catchAsync(async (req, res, next) => {
    console.log(req.get('origin'))
    const tour = await Tour.findById(req.params.tourId);

    const booking = await Booking.find({user:req.user._id,tour:req.params.tourId})
    if(booking.length != 0){
        console.log('not .. not .. not')
        return next(new AppError(`You Alredy booked this tour`, 500))
    }
    console.log(booking)
    // Create Checkout Session 
    const session = await stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        success_url : `${req.get('origin')}/tour/success?tour_id=${req.params.tourId}`,
        cancel_url : `${req.get('origin')}/tour/${tour.slug}`,
        customer_email : req.user.email,
        client_reference_id : req.params.tourId,
        line_items : [
            {
                price_data: {
                    currency: 'USD',
                    unit_amount: tour.price * 100, // Price in cents (e.g., $29.99)
                    product_data: {
                        name: `${tour.name} Tour`, // Name of the item
                        description: tour.description, // Description (optional)
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`], // Image URL (optional)
                    },
                },
                quantity: 1, // Number of items
            },
        ],
        mode : 'payment'
    })

    // send session as responce 
    res.status(200).json({
        status : 'success',
        session
    })
})

exports.createBooking = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.body.tour)
    const newBooking = await Booking.create({
        tour : tour.id,
        user : req.body.user,
        price : tour.price 
    }) 
    res.status(200).json({
        status : 'success',
        newBooking
    })
})

exports.getMyBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ user : req.user._id})
    const tourIds = bookings.map(item => item.tour)
    const tours = await Tour.find({ _id : { $in : tourIds } })

    return res.status(200).json({
        status : 'success',
        meassage : 'Sucessfully find ',
        tours,
    })
    
})