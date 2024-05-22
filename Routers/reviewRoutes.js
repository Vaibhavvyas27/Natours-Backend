const express = require('express')
const reviewController = require('./../controllers/reviewController')
const authController = require('./../controllers/authController')


const router = express.Router({ mergeParams : true })


// Review CRUD

router.route(`/`)
    .get(reviewController.getAllReviews)
    .post(authController.protect, authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.creatReview)



// Protect all routes after this below middleware

router.use(authController.protect)

router.route(`/user/:userId`).get(reviewController.getMyReviews)

// Restrict all routes to admin after this below middleware

router.use(authController.restrictTo('user'))


 
router.route(`/:id`)
    .get(authController.protect, reviewController.getSingleReview)
    .delete(authController.protect, reviewController.deleteReview)
    .patch(authController.protect, reviewController.updateReview)
module.exports = router