const express = require("express")
const app = express()
const fs = require("fs")
const morgan = require("morgan")
const tourRounter = require("./routes/tourRouter")
const userRouter = require("./routes/userRouter")
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const mongoSanitize = require('express-mongo-sanitize')

// Global middlewares: 
// setting security headers using helmet
app.use(helmet())

// Prevent nosql injection attacks:
app.use(mongoSanitize())

// preventing against cross site scripting
app.use(xss())

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

// rate limiter middleware
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

// user handler routes
app.use('/api/v1/user', userRouter)

// tour handler routers
app.use('/api/v1/tours', tourRounter)
// app.use(express.static('./public'))


module.exports = app

