import User from './../module/userModel.js'
import jwt from 'jsonwebtoken'
import promisify from 'util'
// const resetToken = require('./')
import fs from'fs'

// SAVE RANDOM USER TO DB
const saveRandomUser = async(req, res) => {
    try{
        const fileData = fs.readFile(`${__dirname}/../dev-data/data/users copy.json`, 'utf-8', async (err, data) => {
            if (err) throw new Error(err.message);
            const dataAsArray = JSON.parse(data)
            // console.log(dataAsArray);
            const user = await User.create(dataAsArray)

            user.save({ValidateBeforeSave: false})
        })
        // console.log(fileData[1])

        res.status(200).json({
            status: 'success'
        })
    } catch (err){
        res.status(404).json({
            message: err.message
        })
    }
}


const secretKey = () => {
    return 'This sis my secret key data value';
} 
const secretKeyHere = 'This sis my secret key data value';

const secretToken = (id) => {
    return jwt.sign({id}, secretKeyHere, {
        expiresIn: "1200s"
        })
}


// CREATING AND SENDING TOKEN IN COOKIE
const createAndSendToken = (id, statusCode, res) => {
   try{
        const token = secretToken(id)
        const CookieOption = {
            expires: new Date(Date.now() + 3 * 60 * 60 * 1000),
            httpOnly: true
        }
        if(process.env.NODE_ENV === 'production') CookieOption.secure = true;

        res.cookie('jwt', token, CookieOption)
        return token;
   } catch (err) {
    res.status(statusCode).json({
        message: err.message
    })
   }
}

const userSignup = async (req, res) => {
    try {      
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            retypePassword: req.body.retypePassword,
            role: req.body.role,
            passwordChangedAt: req.body.passwordChangedAt
        })
        
        const token = createAndSendToken(newUser._id, 201, res)

        res.status(201).json({
            status: 'success',
            token,
            result: newUser.length,
            data: newUser
        })
    } catch (err){
        res.status(400).json({
            status: 'failed!',
            message: err.message
        })
    }
}

// Creating Query String Class
class userStrings {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter(){
        const queryData = {...queryString}
        const excludedStrings = ['sort', 'limit', 'page']
        excludedStrings.foreach(el => delete queryData[el])
        return this
    }

    field(){
        if(this.queryString.fields){
           let fields = this.queryString.strip(',').join(' ')
           this.query = this.query.select(fields)
        }
        else{
            this.query = this.query.select('-__v')
        }
        return this
    }
}

const getUsers = async (req, res) => {
    try{
        const queryFeatures = new userStrings(User.find(), req.query).field()
        const queryInfo = await queryFeatures.query
        let allUsers = await queryInfo
        res.status(200).json({
            status: 'ok',
            response: allUsers.length,
            data: allUsers
        })
    } catch (err) {
        res.status(400).json({
            status: 'failed!',
            message: err.message
        })
    }
}


const login = (async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password) {
            throw new Error ('Please Provide email and password!')
        }
        const user = await User.findOne({email}).select('+password')
        if (!user || !(await user.checkPassword(password, user.password))){
            throw new Error('Please Provide correct email and password!')
        }
        const token = createAndSendToken(user._id, 201, res)
        res.status(200).json({
            status: 'Success!',
            token,
            message: 'Account logged in!'
        })
        req.user = user;
    } catch (err){
        res.status(400).json({
            status: 'failed!',
            message: err.message
        })
    }
})

// RESET PASSWORD
const resetPasswordRequest = async (req, res) => {
    try{
        const user = await User.findOne({ email: req.body.email})
        if(!user) throw new Error('Email Does Not Exit!')
        const token = await user.passwordResetPass()
        await user.save({ValidateBeforeSave: false})

        try{
            // SENDING EMAIL
            const resetURL = `${req.protocol}://${req.get('host')}/api/v1/passwordReset/${token}`
            await sendEmail ({
                email: user.email,
                subject: "Password Reset link sent here Ignore this if you didnt choose to change password.",
                text: `Hello ${user.name} click ${resetURL} to change your password`
            })

        } catch (err){
            user.passwordResetToken = undefined;
            user.passwordResetExpireTimer = undefined;
            await user.save();
        }
        
        res.status(200).json({
            status: 'success',
            // token,
            message: 'Password reset link has been sent!'
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const passwordReset = async(req, res) => {
    try{ 
        const token = req.params.token;
        const decodedToken = crypto.createHash('sha256').update(token).digest('hex')
        const user = User.findOne({decodedToken : passwordResetToken})
        if(!user) throw new Error('Could not find token, Please Try again!')
        if (user.passwordResetExpireTimer > Date.now()) throw new Error('Token Expired!')

        
        res.status(200).json({
            status: 'success',
            message: 'Password reset successfully'
        })
    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}


const userResetPassword = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedUser = await promisify(jwt.verify)(token, secretKeyHere)
        // console.log(decodedUser.id)

        const user = await User.findById(decodedUser.id).select('+password')
        const dehashedPwd = await user.checkPassword(req.body.currentPassword, user.password)
        // const dehashedPwd = await  bcrypt.compare(user.password, req.body.currentPassword)
        if(!dehashedPwd) throw new Error('Entered Current Password Does Not Match Your Current Password')
        if(!req.body.currentPassword || !req.body.newPassword) throw new Error('You can only update your password through this route!')
        // user.name = req.body.name
        // user.password = req.body.password
        user.save()

        res.status(200).json({
            user,
            message: 'password changed successfully'
        })

    } catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
}

const deleteAcct = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, {active: false})
    console.log(user)
    res.status(200).json({
        status: 'success'
    })
}


const viewUser = async(req, res) => {
    try{
        const queryFeatures = new userStrings(User.find(), req.query).field()
        const queryInfo = await queryFeatures.query
        let allUsers = await queryInfo
        res.status(200).json({
            status: 'ok',
            response: allUsers.length,
            data: allUsers
        })
    } catch (err) {
        res.status(400).json({
            status: 'failed!',
            message: err.message
        })
    }
}

export default {
    saveRandomUser, secretKey, userSignup, getUsers, login, resetPasswordRequest, passwordReset, userResetPassword, deleteAcct, viewUser
}