const express = require('express')
const tourController = require('./../controllers/tourController')
const authController = require('./../controllers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router()

// router.param('id',tourController.checkId)

router.use(`/:tourId/reviews`, reviewRouter)

router.route('/top-5-cheapest').get(tourController.aliasTopTours,tourController.getAllTours)
router.route('/stats').get(tourController.getTourStats)

router.route('/monthly-plan/:year')
    .get(
        authController.protect, 
        authController.restrictTo('admin','lead-guide','guide'), 
        tourController.getMonthlyPlan
    )


router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router.route('/save-to-wishlist/:tourId').get(authController.protect, tourController.addToWishlist)
router.route('/remove-from-wishlist/:tourId').get(authController.protect, tourController.removeFromWishlist)
router.route('/get-wishlist').get(authController.protect, tourController.getWishlist)

router.route(`/`)
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.uploadTourImges, tourController.createToursMiddlware, tourController.creatTour)
    
router.route(`/:id`)
    .get(tourController.getSingleTour)
    .patch(tourController.uploadTourImges, tourController.createToursMiddlware, tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin'), tourController.deleteTour)

module.exports = router