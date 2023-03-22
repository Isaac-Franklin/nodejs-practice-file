const express = require('express');
const tourRounter = express.Router();
const tourController = require('../controller/tourController')

// tourRounter.route('/').post(tourController.createTour)

// Get top five tours with high rating and cheap prices
tourRounter.route('/get-topcheap-tours').get(tourController.cheapTours)

// Aggregator pipeline Execution
tourRounter.route('/get-filtered-tours/:year').get(tourController.AggregateQuery)


tourRounter.route('/')
    .get(
        tourController.VerifyUser, 
        tourController.getTours
        )
    .post(
        tourController.createTour
        )
    .delete(tourController.deleteAll)


tourRounter.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        tourController.VerifyUser, 
        tourController.VerifyUserStatus('admin', 'lead'),
        tourController.deleteTour
        )

module.exports = tourRounter


