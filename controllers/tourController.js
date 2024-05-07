const AppError = require('../utils/appError')
const Tour = require('./../models/tourModel')
const User = require('./../models/userModel')
const APIFeatures = require('./../utils/apiFeatures')  // ApiFeature class Instance 
const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest
const factory = require('./handlerFactory')

// i)  Cheapest 5 Tours filter..

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.feilds = 'name,price,ratingsAverage,difficulty,summary'
    next()
}


// ii)  CRUD Tours Api controller methods..

exports.getAllTours = factory.getAll(Tour)

exports.getSingleTour = factory.getSingleOne(Tour, { path : 'reviews'})

exports.creatTour = factory.createOne(Tour)

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)


// iii) Aggregation Methods  

exports.getTourStats = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                num: { $sum: 1 },  // Count
                numRating: { $sum: '$ratingsQuantity' }, // Sum
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' }, // Avarage
                minPrice: { $min: '$price' }, // Minnimum
                maxPrice: { $max: '$price' }, // Maximum
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
    ])
    res.status(200).json({
        status: 'Success',
        message: 'States of Tours ',
        data: {
            tour: stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 }, // Count of Tours 
                tours: { $push: '$name' },
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: 1 }
        },
        {
            $limit: 12
        }
    ]);
    res.status(200).json({
        status: 'Success',
        results: plan.length,
        data: {
            plan
        }
    })
})



// iv) Geolocation based Methods 

// /tours-within/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    const radius =  unit === 'mi' ? (distance / 3963.2) : (distance / 6378)
    if(!lat || !lng) {
        next(AppError('Plse provide valid latidude & longitude for location',400))
    }

    console.log( distance, lat, lng, unit )

    // Geological Query of Mongodb 
    const tours = await Tour.find({
        startLocation : { $geoWithin : { $centerSphere :  [[lng, lat], radius] } }
    })
    console.log(tours)
    res.status(200).json({
        status : 'Success',
        result : tours.length,
        data : {
            data : tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params
    const [lat, lng] = latlng.split(',')

    // const radius =  unit === 'mi' ? (distance / 3963.2) : (distance / 6378)
    if(!lat || !lng) {
        next(AppError('Plse provide valid latidude & longitude for location',400))
    }  

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    
    const distances =await Tour.aggregate([
        {
            $geoNear : {
                near : {
                    type : 'Point',
                    coordinates : [lng * 1 , lat * 1]
                },
                distanceField : 'distance',
                distanceMultiplier : multiplier
            }
        },
        {
            $project : {
                distance : 1,
                name : 1
            }
        }
    ])
    console.log(distances)
    res.status(200).json({
        status : 'Success',
        data : {
            data : distances
        }
    })
})


// V) Wish List  methods 

exports.addToWishlist = catchAsync(async (req, res) => {
    console.log(req.params.tourId)
    const user = await User.findById(req.user._id)
    const newList =  user.wishlist.push(req.params.tourId)
    user.wishlist = newList
    user.save({validateBeforeSave : false})
    res.status(200).json({
        status: 'Success',
        message : 'Add to wishlist'
    })
})

exports.getWishlist = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist')
    res.status(200).json({
        status: 'Success',
        message : 'Add to wishlist',
        data : {
            wishlist :user.wishlist
        }
    })
})

exports.removeFromWishlist = catchAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
    const index = user.wishlist.indexOf(req.params.tourId);

    // remove that specific tour 
    user.wishlist.splice(index, 1)

    // save the user with updated list 
    user.save({validateBeforeSave : false})

    res.status(200).json({
        status: 'Success',
        message : 'Remove from wishlist'
    })
})
