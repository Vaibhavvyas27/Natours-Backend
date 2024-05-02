const mongoose = require('mongoose')
const Tour = require('./tourModel')

const bookingSchema = new mongoose.Schema(
    {
        tour : {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'booking must belong to a tour'],
        },

        user : {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'booking must belong to a user'],
        },

        price : {
            type: Number,
            required: [true, 'booking must have price'],
        },

        createdAt: {
            type: Date,
            default: Date.now()
        },

        paid: {
            type: Boolean,
            default: true
        },
    }
)


bookingSchema.pre(/^find/, function(next){
    this.populate({
        path : 'tour',
        select : 'name'
    })

    next()
})

Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking