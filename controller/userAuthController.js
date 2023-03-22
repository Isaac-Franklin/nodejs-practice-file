const User = require('./../module/userModel')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
// const resetToken = require('./')
const fs = require('fs')

// SAVE RANDOM USER TO DB
exports.saveRandomUser = async(req, res) => {
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




exports.secretKey = 'This sis my secret key data value';
const secret_key = 'This sis my secret key data value';

const secretToken = (id) => {
    return jwt.sign({id}, secret_key, {
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
    res.status(500).json({
        message: err.message
    })
   }
}

exports.userSignup = async (req, res) => {
    try {
        // const token = secretToken(newUser._id)
        
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

exports.getUsers = async (req, res) => {
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



exports.login = (async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password) {
            throw new Error ('Please Provide email and password!')
        }
        const user = await User.findOne({email}).select('+password')
        if (!user || !(await user.checkPassword(password, user.password))){
            throw new Error('Please Provide correct email and password!')
        }
        // console.log(user)
        // const token = secretToken(user._id);
        const token = createAndSendToken(user._id, 201, res)
        // console.log(token)
        res.status(200).json({
            status: 'Success!',
            token,
            message: 'Account logged in!'
        })
        req.user = user;
        // console.log(`see it here ${req.user}`)
    } catch (err){
        res.status(400).json({
            status: 'failed!',
            message: err.message
        })
    }
})

// RESET PASSWORD
exports.resetPasswordRequest = async (req, res) => {
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

exports.passwordReset = async(req, res) => {
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

exports.userResetPassword = async(req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedUser = await promisify(jwt.verify)(token, secret_key)
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

exports.deleteAcct = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, {active: false})
    console.log(user)
    res.status(200).json({
        status: 'success'
    })
}



