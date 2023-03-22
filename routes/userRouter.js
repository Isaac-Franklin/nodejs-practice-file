const express = require('express');
const userRoutes = express.Router();
const userAuth = require('./../controller/userAuthController')
const tourController = require('../controller/tourController')


userRoutes.route('/').post(userAuth.userSignup).get(userAuth.getUsers)
userRoutes.route('/login').post(userAuth.login)
userRoutes.route('/resetpassword').patch(userAuth.resetPasswordRequest)
userRoutes.route('/userresetpassword').patch(userAuth.userResetPassword)
userRoutes.route('/deleteAccount').delete(tourController.VerifyUser, userAuth.deleteAcct)


// activate save random users to db
userRoutes.route('/saverandomusers').post(userAuth.saveRandomUser)

module.exports = userRoutes

