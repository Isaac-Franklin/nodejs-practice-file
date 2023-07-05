import path from 'path'
import express from "express"
const app = express()
import fs from "fs"
import morgan from "morgan"
import tourRounter from "./routes/tourRouter.js"
import userRouter from "./routes/userRouter.js"
import reviewRounter from "./routes/reviewRounter.js"
import viewRounter from "./routes/viewRouter.js"
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import promise from 'bluebird'
import Q from 'q'

// Global middlewares: 
// setting security headers using helmet
app.use(helmet())

// Prevent nosql injection attacks:
app.use(mongoSanitize())

// preventing against cross site scripting
app.use(xss())

// activating http pollution prevention
app.use(hpp({
    whitelist: ['duration']
}))

// routing to pug template below using the path module:
// app.set('views', path.join('/', 'views'));
app.set('views', path.join('views'));
app.set('view engine', 'pug')

// app.get('/', (req, res) => {
//     res.status(200).render('base')
// })


// app.get('/overview', (req, res) => {
//     res.status(200).render('overview')
// })

// one that allows for the resquest body to be addedd to the request from the client: express.json() - bodyParser middleware
app.use(express.json({ limit: '10kb' }))
// -the '{ limit: '10kb' }' within the bodyParser middleware is a security paramater that limits the sign of data that
// can be sent within the body. 

// morgan middleware gets the url or request path.
app.use(morgan('dev'))
// logges the request time
app.use((req, res, next) => {
    req.timeAt = new Date().toISOString();
    console.log(req.timeAt);
    next();
})

// rate limiter middleware: Number of request a server can take in and the time interval for counts to restart.
const limiter = rateLimit({
    max: 100,
    windowMs: 60  * 60 * 1000,
    message: 'Request rate limit exceeded! Try again after an hour.'
})
app.use('/api', limiter)


// logges a random test to console
app.use((req, res, next) => {
    console.log("Hello From My Middleware 🧡");
    next();
})


// Views routes
app.use('/', viewRounter)

// user handler routes
app.use('/api/v1/user', userRouter)

// tour handler routers
app.use('/api/v1/tours', tourRounter)
app.use(express.static(path.join('public')))

// review routes
app.use('/api/v1/review', reviewRounter)


export default app


// // DENODIFING A FUNCTION
// let Add = () => {
//     let sum = 1 + 2 + 3
//     return sum
// }

// const promiseFxn = Q.denodeify(Add)

// let promiseA = Add

// promiseA.then(() => {
//     console.log('Addition is DONE')
// })


let readFileStream = fs.createReadStream('./text.txt');
// readFile.on('data', (data) => {
//     let readableData = data.toString()
//     console.log(readableData);
// });

let writeFileStream = fs.createWriteStream('./text2.txt');

readFileStream.pipe(writeFileStream);

