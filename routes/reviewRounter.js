import express from 'express'
const reviewRounter = express.Router();
import reviewController from '../controller/reviewController.js'

reviewRounter.route('/').get(reviewController.AllReviews).post(reviewController.createReview)


export default reviewRounter