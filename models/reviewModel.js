const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'rewiew can not be null'],
        },
        rating: {
            type: Number,
            min: [1, 'Rating must not be less than 1'],
            max: [5, 'Rating must not be grater than 5']
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'rewiew must belong to a user'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'review must belong to a tour'],

        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path : 'tour',
        select : 'name'
    }).populate({
        path : 'user',
        select : 'name photo'
    })
    next()
})

reviewSchema.statics.calcAvgRating = async function(tourId){
    const stats = await this.aggregate([
        {
            $match : {tour : tourId}
        },
        {
            $group : {
                _id : '$tour',
                nRating : {$sum : 1},
                avgRating : {$avg : '$rating' }
            }
        }
    ])
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage : stats[0].avgRating,
            ratingsQuantity : stats[0].nRating
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage : 4.5,
            ratingsQuantity : 0
        })
    }
}




// indexing 

reviewSchema.index({tour:1, user:1},{ unique: true })


// Caluculate Stats on Create of Review 

/***  Note :  --> Post does not have acess to next  ***/

reviewSchema.post('save', function () {
    // point to current review
    this.constructor.calcAvgRating(this.tour)   
})




// Find udpted & deleted Record and set into variable 

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.rev = await this.clone().findOne()
    next() 
})



// Caluculate Stats on Delete and Update of Reviews

reviewSchema.post(/^findOneAnd/, async function () {
    await this.rev.constructor.calcAvgRating(this.rev.tour._id)
})



review = mongoose.model("Review", reviewSchema);

module.exports = review