import reviewModel from '../module/reviewModule.js'

const AllReviews = async (req, res) => {
    try{
        let allReview = await reviewModel.find({})
        res.status(200).json({
            status : 'success',
            result: allReview.length,
            message : {
                data : allReview
            }
        })
    }
    catch(err){
        res.status(404).json({
            status: 'failed',
            message: err.message
        })
    }
}

const createReview = async (req, res) => {
    try{
        let reviewCreated = await reviewModel.create(req.body)
        res.status(200).json({
            status: 'success',
            created_Review : reviewCreated
        })
    }
    catch(err){
        res.status(404).json({
            status: 'failed',
            message: err.message
        })
    }
}

export default {
    AllReviews, createReview
}