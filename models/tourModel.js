const mongoose = require('mongoose');
const slugify = require('slugify')
const validator = require('validator')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        required: [true, 'Must have name'],
        type: String,
        unique: true,
        trim: true,
        maxlength : [40, 'A tour name must have less then 40 characters '],
        minlength : [4, 'A tour name must have atleast 4 characters '],
        // validate : [validator.isAlpha,'A tour name must only contain alphabates']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is Required'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        trim: true,
        enum : {
            values : ['easy', 'medium', 'difficult'],
            message : 'Difficulty is either : easy, medium, difficult ' 
        }
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        max:[5, 'Rating Average must not be grater than 5'],
        set: val => Math.round(val * 10)   // Round off values
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price name is Required'],
    },
    priceDiscount:{ 
        type: Number,
        validate :{
            validator: function(val){
                // this only works with create on new doc not on update
                return val < this.price
            },
            message: " Discount price ({VALUE}) must be less than actual price.. " 
        }
    },
    summary: {
        type: String,
        required: [true, 'Price name is Required'],
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have summary'],
    },
    description: {
        type: String,
        trim: true,
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have cover image'],
    },
    images: [String],
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startLocation : {
        // Geo Json
        type : {
            type : String,
            default : 'Point',
            enum : ['Point']
        },
        coordinates :  [Number],
        address : String,
        description  : String
    },
    locations : [
        {
            type : {
                type : String,
                default : 'Point',
                enum : ['Point']
            },
            coordinates :  [Number],
            address : String,
            description  : String,
            day : Number
        },
        
    ],
    guides : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'User'
        }
    ],
    slug: String,
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)


tourSchema.index({price:1, ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation : '2dsphere'})

// tourSchema.virtual('durationWeek').get(function () {
//     return this.duration / 7;
// });


// Virtual Propulate
tourSchema.virtual('reviews', {
    ref : 'Review',
    foreignField : 'tour',
    localField : '_id'
});


// DOC Middleware run on save() & create() method 
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// tourSchema.pre('save', async function (next) {
//     const guidesPromises  =  this.guides.map(async id => await User.findById(id) )
//     this.guides =  await Promise.all(guidesPromises)
//     next()
// })


// Query Middleware run on find() method
tourSchema.pre('find', function (next) {
    this.find({ secretTour : { $ne : true } })
    next()
})

tourSchema.pre(/^find/, function (next) {

    // Checks user request is contain "guides" feild or not 
    if (this._userProvidedFields && !(this._userProvidedFields.hasOwnProperty("guides"))) {
        return next();
    }

    this.populate({
        path : 'guides',
        select : '-__v -passwordChangedAt '
    })
    next()
})

Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour