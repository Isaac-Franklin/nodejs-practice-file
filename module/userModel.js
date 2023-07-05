import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto'


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, 'A user much have a name']
    },
    email: {
        type: String,
        require: [true, 'A user must have an email address'],
        // unique: true,
        lowercase: true,
        validate: {
            validator: validator.isEmail,
            messaage: 'This is not a valid email address'
        },
        // validate: [validator.isEmail, 'This is not a valid email address']
    },
    photo: String,
    role: {
        type:String,
        enum: ['admin', 'user', 'lead'],
        default: 'user'
    },
    password:{
        type: String,
        minlength: 8,
        require: [true, 'A user must have a password'],
        select: false
    },
    retypePassword:{
        type: String,
        require: [true, 'Please retype your password'],
        validate: {
            validator: function (el){
                return this.password === el
            },
            message: 'Please your passwords must match each other.'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpireTimer: Date,
    active: {
        type: Boolean,
        default: true
    }
});

// CREATING A DOCUMENT MIDDLEWARE
userSchema.pre('save', async function (next){
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)
    this.retypePassword = undefined;
    next();
})

// DO NOT DISPLAT INACTIVE ACCOUNT - query middleware
userSchema.pre(/^find/, function(next){
    this.find({active: {$ne : false}})
    next()
})

//AN INSTANCE METHOD: A METHOD THAT WILL BE AVAILABLE IN ALL DOCUMENTS OF A PARTICULAR COLLECTION.

userSchema.methods.checkPassword = async function(enteredPwd, hashedPwd){
    return await bcrypt.compare(enteredPwd, hashedPwd)
    // console.log(hashedPwd)
}

// CHECK WHEN USER CHANGED PASSWORD LAST
userSchema.methods.changedPassword= function (JWTTimeStamp){
    if(this.passwordChangedAt){
        const changedPasswordTime = this.passwordChangedAt.getTime() / 1000
        // console.log(changedPasswordTime, JWTTimeStamp)
        return JWTTimeStamp < changedPasswordTime ; //100 300 . 400 300
        // time for password change is before the JWT generation = TRUE: token is valid
    }
    return false
    // time for password change is after the JWT generation = FALSE: token is invalid
}

// CHECK TO BE SURE USER EXIST WHEN ALLOCATING TOKEN
userSchema.methods.checkIfUserExit = async function(userID){
    const currentUser = await userID
    // if (!currentUser) return false;
    if (this._id != currentUser) return false;
    return true
}

// METHOD INSTANCE FOR PASSWORD RESET INFO
userSchema.methods.passwordResetPass = function (){
    const resetPassToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetPassToken).digest('hex');
    this.passwordResetExpireTimer = Date.now() + 10 * 60 * 1000;
    // console.log(this.passwordResetToken, resetPassToken)

    return resetPassToken;
}



const userModel = mongoose.model('userModel', userSchema)
export default userModel;
