const TourModel = require(`${__dirname}/../module/tourModule`)
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const {secretKey} = require('./userAuthController')
const User = require('./../module/userModel')


exports.createTour = async (req, res) => {
    try{
        // const token = await jwt.sign({id: TourModel._id}, secretKey, {
        //     expiresIn: 2000
        // })
        const newTour = await TourModel.create(req.body);
        res.status(200).json({
            status: 'success',
            // token: token,
            data: {
                data: newTour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'failed',
            message: err.message
        })
    }
}

// this.password = bcrypt(this.password, 12)


// CREATE THE QUERY STRING CLASS: SHOULD BE A CLASS
class QueryStringFxn {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }
    filtering(){
        // BUILD MY QUERY STRING
        let queryData1 = {...this.queryString}
        const excludedQuery = ['page', 'limit', 'sort', 'fields']
        excludedQuery.forEach(el => {delete queryData1[el]})
        // COMPLEX FILTERING
        let queryData = JSON.stringify(queryData1)
        let complexQuery = queryData.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        // let query = TourModel.find(JSON.parse(complexQuery));
        this.query.find(JSON.parse(complexQuery));
        return this
    }
    sortQuery(){
        if (this.queryString.sort){
            let newQuery = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(newQuery)
        }else{
            this.query = this.query.sort('-createdAt')
        }
        return this
    }
    fieldsQuery(){
        if (this.queryString.fields){
            let fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields)
            // console.log(this.query)
        }else{
            this.query = this.query.select('-__v')
        }
        return this
    }

    pageQuery(){
        if (this.queryString.page){
            const page = this.queryString.page * 1 || 1;
            const limit = this.queryString.limit * 1 || 100;
            const skip = (page - 1) * limit
        //     const tourCount = TourModel.countDocuments()
            
        //     this.query = this.query.skip(skip).limit(limit)
        //     if (skip >= tourCount) throw new Error('Page Cannot be found')
        }
        // else{
        //     const page = 1;
        //     const limit = 2;
        //     const skip = (page - 1) * limit;
        //     this.query = this.query.skip(skip).limit(limit)
        // }
        return this
    }
    // return this.query
}

// VERIFY TOKEN MIDDLEWARE BEFORE FETCHING DATA
exports.VerifyUser = async (req, res, next) => {
    try{
        // check if header exits and if token is there
        if(!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) throw new Error('Token missing in header!')
        const token = await (req.headers.authorization).split(' ')[1]

        if (!token) throw new Error('Your Are Not Logged In!')
        const decodedToken = await promisify(jwt.verify)(token, secretKey)

        const user = await User.findById(decodedToken.id)
        // console.log(user._id)
        const existingUser = await user.checkIfUserExit(decodedToken.id);
        if(existingUser != true) throw new Error('This User Does Not Exit!')

        const isPasswordChanged = await user.changedPassword(decodedToken.iat)
        // console.log(isPasswordChanged)
        if (isPasswordChanged) throw new Error('Token Expired. Kindly Login Again')
        // if(isPasswordChanged) throw new Error('This user changed password therefore Token is wornout')
        req.user = user;
        next()
    } catch (err){
        res.status(401).json({
            status: 'failed!',
            message: err.message
        })
    }
}


// GET ALL TOURS
exports.getTours = async (req, res) => {
    try{
        // const Features = new QueryStringFxn(TourModel.find(), req.query).filtering().complexFilter().sortQuery().fieldsQuery().pageQuery()
        // const Features = new QueryStringFxn(TourModel.find(), req.query).filtering().sortQuery().fieldsQuery().pageQuery()
        const Features = new QueryStringFxn(TourModel.find(), req.query)
        let query1 = await Features.query
        const allTours = await query1
        res.status(200).json({
            status: 'ok',
            results: allTours.length,
            message: {
                data: allTours
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
}

// GET SINGLE TOUR
exports.getTour = async (req, res) => {
    try{
        const id = req.params.id;
        const Tour = await TourModel.findOne({_id : id})
        res.status(200).json({
            status: 'success',
            message: {
                data: Tour
            }
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
}

// updateTour

exports.updateTour = async (req, res) => {
    try{
        const tour = await TourModel.findOneAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        res.status(200).json({
            status: 'success',
            message: {
                tour
            }
        })
    } catch(err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
}


// verify user middleware before delete tour

exports.VerifyUserStatus = (...roles) => {
    return (req, res, next) => {
    try{
            if(!roles.includes(req.user.role)) throw new Error('You do not have permission to delete this tour')
            res.status(200).json({
                status: 'success',
                message: 'Tour Deleted Successfully'
            })
            next()
        }catch (err){
            res.status(403).json({
                message: err.message
            })
        }
    } 
}

// deleteTour

exports.deleteTour = async (req, res) => {
    try{
        const tour = await TourModel.findOneAndDelete({_id : req.params.id})
        res.status(200).json({
            status: 'success',
            message: 'Tour successfully deleted'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
}

// DELETE ALL DOCUMENTS IN THE COLLECTION

exports.deleteAll = async (req, res) => {
    try{
        // await TourModel.findOneAndDelete();
        await TourModel.deleteMany();
        // AllTours.deleteMany()
        res.status(200).json({
            status: 'ok',
            message: 'DATA DELETED!'
        })
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        })
    }
}


// GET TOP FIVE CHEAP, BEST TOURS FOR CLIENT
exports.cheapTours = async (req, res) => {
    try{
        let tours = await TourModel.find({rating: {$gte : 3}, price: {$lt : '300'}})
        res.status(200).json({
            status: 'success',
            message: {
                data: tours
            }
        })
    }
    catch (err){
        res.status(404).json({
            status: 'error',
            message: err.message
        })
    }
}



// CREATING AN AGGREGATOR PIPELINE
exports.AggregateQuery = async (req, res) => {
    const givenYear = req.params.year * 1;
    try{
        let saveData = await TourModel.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${givenYear}-01-01`),
                        $lt: new Date(`${givenYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDates'},
                    totalNumber: {$sum: 1},
                    name: {$push: '$name'},
                }
            },
            {
                $sort: {_id: 1},
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $select: {
                    _id: -1
                }
            }
        ])

        res.status(200).json({
            status: 'success',
            result: saveData.length,
            data: saveData
        })
    } catch (err){
        res.status(404).json({
            status: 'error',
            // message: err.message
        })
    }
}

// reset password functionality

/*
// STEPS: 
1. create a token, send token to user via url via email using nodemailer, encrypt token using 'crypto' and save to db.
2. update expiration date for created token.

*/