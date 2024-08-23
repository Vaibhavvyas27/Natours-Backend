const mongoose = require('mongoose');
const validator = require('validator')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, 'User must have name !'],
    },
    email : {
        type : String,
        required: [true, 'User Email is Reqired !'],
        unique : true,
        lowercase : true,
        validate : [validator.isEmail,'Email must be valid email'],
        
    },
    role : {
        type : String,
        enum : ['user','admin','guide'],
        default : 'user', 
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date,
    password : {
        type : String,
        required: [true, 'Please Provide a password!'],
        minlength : [8, 'A Password length must be grater than 8  '],
        select : false
    },
    passwordConfirm : {
        type : String,
        required: [true, 'Please comfirm your password !'],
        minlength : [8, 'A Password length must be grater than 8  '],
        validate : {
            // This only Work on save !!
            validator : function(passConfirm){
                return passConfirm === this.password
            },
            message: "Password & Confirm Password doesn't Match" 
        },
    },
    photo : {
        type : String,
    },
    active : {
        type : Boolean,
        default : true,
        select : false 
    },
    wishlist : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'Tour'
        }
    ],
    
})

//  Text Search index 

userSchema.index({ name : 'text', email : 'text' })

// Model Middlewares 

userSchema.pre(/^find/, function (next) {
    this.find({ active : { $ne : false } })
    next()
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.isNew) {
        return next()
    }
    this.passwordChangedAt = Date.now()
    next()
})



// Custom  Model methods 

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = function(JWTTimeStemp){
    if(this.passwordChangedAt){
        const changedTimeStemp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStemp < changedTimeStemp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + (4 * 60 * 1000); // 4 min from now

    // console.log({resetToken}, this.passwordResetToken)
    return resetToken;
}


const User = mongoose.model("User", userSchema);

module.exports = User