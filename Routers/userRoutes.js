const express = require('express')
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')


const router = express.Router()


//  SignUP - Login Routes

router.route(`/signup`).post(authController.signUp)
router.route(`/login`).post(authController.login)
router.route(`/logout`).get(authController.logout)



//  Password Reset Routes

router.route(`/forgot-password`).post(authController.forgotPassWord)
router.route(`/reset-password/:token`).patch(authController.resetPassWord)



// Protect all routes after this below middleware

router.use(authController.protect)


//  Current Logged in User's Routes

router.route(`/update-password`).patch(authController.updatePassword)
router.patch(`/update-me`, userController.uploadUserPhoto, userController.updateMe)
router.route(`/delete-me`).delete(userController.deleteMe)
router.route(`/me`).get(userController.getMe, userController.getSingleUser)
router.route(`/auth-check`).get(authController.protect)

//  User CRUD

router.use(authController.restrictTo('admin'))

router.route(`/`).get(userController.getAllUsers)
router.route(`/:id`)
    .patch(userController.updateUser)

module.exports = router
