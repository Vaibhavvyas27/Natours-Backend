const AppError = require('../utils/appError')
const catchAsync = require('./../utils/catchAsync')   //  Function to catch & throw error from async reqest
const APIFeatures = require('./../utils/apiFeatures')

exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc){
        return next(new AppError(`Document releted to this ID is not found !!`, 404))
    }
    
    res.status(200).json({
        status: 'Success',
        message: 'Deleted Sucessfully',
        data: doc
    })
})

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    console.log('from update')
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })
    if(!doc){
        return next(new AppError(`Document releted to this ID is not found !!`, 404))
    }
    res.status(200).json({
        status: 'Success',
        message: 'Updated Sucessfully',
        data:{ 
            data : doc
        }
    })
})

exports.createOne = (Model) => catchAsync(async (req, res) => {
    console.log('Create Strat')
    const newDoc = await Model.create(req.body)
    res.status(200).json({
        status: 'Success',
        message: 'Created SuccessFully..',
        data: {
            doc: newDoc
        }
    })
})

exports.getSingleOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populateOptions)
    if(!doc){
        return next(new AppError(`Document releted to this ID is not found !!`, 404))
    }
    res.status(200).json({
        status: 'Success',
        result: doc.length,
        data: {
            data: doc
        }
    })
})

exports.getAll = (Model) => catchAsync(async (req, res) => {

    // For Get Perticuler Post's Review
    let filter = {}
    if(req.params.tourId){
        filter = {tour:req.params.tourId}
    }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFeilds().paginate()

    // Execute Query ...
    const docs = await features.query
    res.status(200).json({
        status: 'Success',
        result: docs.length,
        data: {
            data: docs
        }
    })
})