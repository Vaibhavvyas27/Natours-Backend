const { promisify } = require('util') 
const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const User = require('./../models/userModel')
const crypto = require('crypto')
const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest


const signToken = (Userid)=>{
    return jwt.sign({ id : Userid }, process.env.JWT_SECRET,{
        expiresIn : process.env.JWT_EXPIRES_IN
    })   
}

// ------------ Login & Signup ------------ 

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        passwordConfirm : req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    })

    const token = signToken(newUser._id)

    res.cookie('jwt_cookie', token, {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure : true,
        httpOnly : true
    })
    const url = 'http://localhost:5173/profile'
    new Email(newUser, url).sendWelcome()
    newUser.password = undefined
    res.status(201).json({
        status: 'Success',
        message: 'Sign up Successfully..',
        token,
        data: {
            user: newUser
        }
    })
})

exports.login = catchAsync(async (req, res, next) => {
    console.log('strat')
    console.log(req.body)
    const {email,password} = req.body

    if(!email || !password){
        return next(new AppError(`Please provide valid email and password `, 400))
    }

    var user = await User.findOne({email:email}).select('+password')
    if(!user  || !(await user.correctPassword(password, user.password))){
        return next(new AppError(`Incorrect Password or Email`, 400))
    }

    const token = signToken(user._id)
    const { password:cryptPassword , __v, ...userTerminated} = user._doc;

    res.cookie('jwt_cookie', token, {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // sameSite: 'None',
        httpOnly : true
    }).status(201).json({
        status: 'Success',
        message: 'Login Successfully..',
        user : userTerminated,
        token,
    })
})



// ------------ Security & Authorization ------------ 

exports.protect = catchAsync(async (req, res, next) => {

    let token;
    // Check Header Token 
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    else if(req.cookies.jwt_cookie){
        token = req.cookies.jwt_cookie
    }
    if(!token){
        return next(new AppError(`You are not logged in ! Please login to get access.`,401))
    }
    
    // Decode Token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    
    // Check Still User is Exist or not
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError(`User belong to this token is no longer exists`,401))
    }

    

    // Check Password was changed or not..
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next(new AppError(`Password was changed ! Try Again`,401))
    }
    
    req.user = currentUser;

    if(req.path === '/auth-check'){
       return res.status(201).json({
            message : 'Success',
        })
    }
    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError(`You Do Not Have Permission To Perform This Action`,403))
        }
        next()
    }
    
}



// ------------ Change Password Functionality ------------ 

exports.forgotPassWord = catchAsync(async (req, res, next) => {
    console.log(req)
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError(`There is no user with this email address`, 400))
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false});

    const resetURL =  `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`

    const message = `Forgot your password? Submit a request with your new password \nto:"${resetURL}".\nIf You didn't forget your password then please ingnore this e-mail!`


    try {
        new Email(user, resetURL).sendPassReset()
    
        res.status(200).json({
            status : 'success..',
            message : 'Password reset link is send to your email'
        })
        
    } catch (error) {
        console.log(error)
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({validateBeforeSave : false});
        return next(new AppError(`There was and error in sending the email. Try again later!`, 500))
    }
    
})

exports.resetPassWord = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt : Date.now()}
    })
    if(!user){
        return next(new AppError(`Token is invalid or has Expired`, 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires =undefined
    await user.save()
    
    const token = signToken(user._id)
    res.status(201).json({
        status: 'Success',
        message: 'Login Successfully..',
        token,
    })
})



// ------------ Change logged in user's password functionality ------------ 

exports.updatePassword = catchAsync(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")

    if(!(await user.correctPassword(req.body.currentPassword, user.password))){
        return next(new AppError(`Incorrect Password ....`, 400))
    }
    
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    
    const token = signToken(user._id)
    res.status(201).json({
        status: 'Success',
        message: 'Password Changed Sucessfully',
        token,
    })
})


exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie('jwt_cookie')
    res.status(201).json({
        status: 'Success',
        message: 'LogOut Sucessfully',
    })
})