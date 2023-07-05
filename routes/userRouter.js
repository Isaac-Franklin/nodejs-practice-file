import express from 'express'
const userRoutes = express.Router();
import userAuth from './../controller/userAuthController.js'
import tourController from '../controller/tourController.js'

userRoutes.route('/viewusers').get(userAuth.viewUser)
userRoutes.route('/').post(userAuth.userSignup).get(userAuth.getUsers)
userRoutes.route('/login').post(userAuth.login)
userRoutes.route('/resetpassword').patch(userAuth.resetPasswordRequest)
userRoutes.route('/userresetpassword').patch(userAuth.userResetPassword)
userRoutes.route('/deleteAccount').delete(tourController.VerifyUser, userAuth.deleteAcct)


// activate save random users to db
userRoutes.route('/saverandomusers').post(userAuth.saveRandomUser)

export default userRoutes

