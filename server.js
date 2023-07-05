import dotenv from "dotenv"
import app from "./index.js"
// const mongoose = require("mongoose")
// const DB = 'mongodb+srv://franklin:12345@cluster0.dm5l9rl.mongodb.net/?retryWrites=true&w=majority'
// // const DB = 'mongodb+srv://franklin:12345@cluster0.dm5l9rl.mongodb.net/?retryWrites=true&w=majority'
// // const DB = process.env.DATABASE.replace('PASSWORD', process.env.DATABASE_PASSWORD)

// // MONGO DB CONNECTION THROUGH MONGOOSE RETURNS A PROMISE, RESOLVE WITH A THEN.
// mongoose.connect(DB, {
//     useCreateIndexes: true,
//     useNewUrlParser: true,
//     useFindAndModify: false
// }).then(() => {console.log('connection to DB Successfull!')})
// // console.log(process.env.DATABASE)

// // CREATING A SCHEMA
// const tourSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'A Tour Must Have A Name!']
//     },
//     price: {
//         type: Number,
//         default: 400
//     },
//     rating: {
//         type: Number,
//         unique: true,
//         required: [true, 'A Tour Must Have A Rating!']
//     }
// })
// // CREATED MODEL

// exports.TourModel = mongoose.model('TourModel', tourSchema)

// // CREATING A DOCUMENT FROM THE MODEL: CHANNEL REQUESTS TO THE CONTROLLER TO HANDLE REQUESTS
// app.use('/', )


// const Tour1 = new TourModel({
//     name: 'My new tour name',
//     price: 499,
//     value: 4.8
// })

// Tour1.save().then((doc) => {
//     console.log(doc)
// }).catch((err) => {
//     console.log(err)
// })


dotenv.config({
    path: './config.env'
})


// console.log(process.env)
// console.log(app.get('env'))

const port = 3000;
app.listen(port, () => {
    console.log("API currently running...")
})

