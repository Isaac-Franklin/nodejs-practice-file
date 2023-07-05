import mongoose from 'mongoose';

const reviewModelCreate = new mongoose.Schema({
    review: {
        type: 'string',
        required: [true, 'A review must have a name']
    },
    // PARENT REFERENCING
    user : {
        type: mongoose.Schema.ObjectId,
        ref : 'userModel',
        required : [true, 'Please Indicate Who Gave This Review']
    },
    // PARENT REFERENCING
    tour : {
        type : mongoose.Schema.ObjectId,
        ref : 'TourModel',
        required : [true, 'Please Indicate which tour has this review']
    },
    created_at : {
        type : Date,
        default : Date.now()
    },
    rating : {
        type: Number,
        min: 1,
        max: 5
    }
    },
    {
        toJSON : {virtuals : true},
        toObject : {virtuals : true}
    }
)

// FILL IN/POPULATE TOUR AND USER PARENT DATA IN PLACE OF ID FUNCTIONALITY BELOW
reviewModelCreate.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name'
    }).populate({
        path: 'tour',
        select: 'name'
    })

    next()
})









const reviewModel = mongoose.model('reviewModel', reviewModelCreate)
export default reviewModel