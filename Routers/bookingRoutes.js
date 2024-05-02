const express = require('express')
const bookingController = require('./../controllers/bookingController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router()

router.get('/checkout-session/:tourId', 
    authController.protect, 
    bookingController.getCheckoutSessions
)

router.post('/create-booking/', 
    authController.protect, 
    bookingController.createBooking
)

router.get('/my-bookings', 
    authController.protect, 
    bookingController.getMyBookings
)

module.exports = router