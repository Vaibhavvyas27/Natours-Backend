const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest
const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')
const multer = require('multer')
const {uploadOnCloudinary} = require('./../utils/cloudinary') 


const storage = multer.diskStorage({
    destination: function(req, file, cb) { 
        return cb(null, "./public/img/users")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }
    else{
        cb(new AppError(`Please Upload Valid image !!`, 400), false)
    }
}

const upload = multer({
    storage : storage,
    fileFilter : multerFilter
})


exports.uploadUserPhoto = upload.single('file')



// Filter body obj from api request  

const filterObj = (obj, ...allowedFeilds)=>{
    const newObj = {}
    Object.keys(obj).forEach(item => {
        if(allowedFeilds.includes(item)){
            newObj[item] = obj [item]
        }
    })
    return newObj;
}


// Logged in User's Actions

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.deleteMe = catchAsync( async (req, res, next)=>{
    await User.findByIdAndUpdate(req.user.id,{active : false})
    
    res.status(204).json({
        status : "success",
        data : null
    })
})

exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError(`This is not for Password updates`,400))
    }

    let filterdBody
    
    if(req.file){
        const photoUrl= await uploadOnCloudinary(req.file.path)
        req.body.photo = photoUrl
        filterdBody  = filterObj(req.body,'name','email','photo')
        
    }
    else{
        console.log('Not file')
        filterdBody  = filterObj(req.body,'name','email')
    }
    const user = await User.findByIdAndUpdate(req.user.id, filterdBody ,{
        new: true,
        runValidators : true
    })

    await user.save({validateBeforeSave : false})

    res.status(201).json({
        status: 'Success',
        message: 'Data Changed Sucessfully',
        user,
    })
})




// User CRUD

exports.getAllUsers =  factory.getAll(User)
exports.getSingleUser = factory.getSingleOne(User)
exports.updateUser = factory.updateOne(User)