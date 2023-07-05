import mongoose from "mongoose"
const DB = 'mongodb+srv://franklin:12345@cluster0.dm5l9rl.mongodb.net/?retryWrites=true&w=majority'
import bcrypt from 'bcrypt'
// const User = require('./userModel')


// MONGO DB CONNECTION THROUGH MONGOOSE RETURNS A PROMISE, RESOLVE WITH A THEN.
mongoose.connect(DB, {
    createIndexes: true,
    // useCreateIndexes: true,
    useNewUrlParser: true,
    useFindAndModify: false
}).then(() => {console.log('connection to DB Successfull!')})
// console.log(process.env.DATABASE)

// CREATING A SCHEMA
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        maxlength: [40, 'A tour must have less or equal to 40 characters'],
        minlength: [10, 'A tour must have more or equal to 10 characters'],
        required: [true, 'A Tour Must Have A Name!']
    },
    price: {
        type: Number,
        // unique: true,
        default: 400
    },
    // rating: {
    //     type: Number,
    //     max: [5, 'A Tour Must Have A Rating Below 5.0!'],
    //     min: [1, 'A Tour Must Have A Rating Above 1.0!'],
    //     default: 4.0
    // },
    duration : {
        type: Number,
        required: [true, 'A Tour Must Have A Duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true, 'A Tour Must Have A Max Group Size']
    },
    difficulty: {
        type: String,
        enum: {
            values: ['easy', 'difficult', 'medium', 'Easy', 'Medium', 'Difficult'],
            message: "This must have a value of any of these 'easy', 'difficult', 'medium', 'Easy', 'Medium', 'Difficult'"
          }
    },
    ratingsAverage: {
        type: Number,
        required: [true, 'A Tour Must Have A Rating Average!']
    },
    ratingsQuantity: {
        type: Number,
        required: [true, 'A Tour Must Have A Rating!']
    },
    summary: {
        type: String,
        required: [true, 'A Tour Must Have A Summary']
    },
    description: String,
    imageCover: String,
    images: [String],
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    }, password: {
        type: String,
        unique: true
    },
    // setting up embedded start location properties
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        address: String,
        coordinates: [Number],
        description: String
    }, locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // using embedding method: 'guides: Array'
    // below is the normalized/relative method in use
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'userModel'
        }
    ]
})


tourSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12)
    this.retypePassword = undefined;
    next();
})


// creating a query middleware for populating
// tourSchema.pre('find', function(next){
//     this.guides = this.guides.populate({
//         path: 'guides',
//         select: '-__v -passwordChangedAt'
//     })
//     next()
// })


const TourModel = mongoose.model('TourModel', tourSchema)

export default TourModel
