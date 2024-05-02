const express = require('express')
const morgan = require('morgan') 
const toursRouter = require('./Routers/tourRoutes')
const usersRouter = require('./Routers/userRoutes')
const reviewRouter = require('./Routers/reviewRoutes')
const bookingRouter = require('./Routers/bookingRoutes')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const AppError = require('./utils/appError')       // Custom Error Class
const hpp = require('hpp') // for prevent parameter pollution  
const app = express()

app.use(cookieParser())

const corsOptions ={
    origin:['http://localhost:5173','https://dev-natours-vv.netlify.app','https://natours-frontend-blush.vercel.app'],
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
    methods: ['POST', 'PUT', 'PATCH' , 'GET', 'OPTIONS', 'HEAD'],
}
app.use(cors(corsOptions));


// ------------------- Middlewares -------------------



// inspection of request in dev mode 
if (process.env.NODE_ENV === 'devlopment') {
    app.use(morgan('dev'))
}


// serving static files 
app.use(express.static(`${__dirname}/public`))


// Prevent Parameter Pollution 
app.use(hpp({
    whitelist : [
        'duration',
        'maxGroupSize',
        'ratingsAverage',
        'ratingsQuantity',
        'difficulty',
        'price'
    ],
}))


// Allow to send body with api call
app.use(express.json())


// Custom middleware 
app.use((req, res, next) => {
    req.Time = new Date().toISOString()
    next()
})




// ------------------- Routes -------------------


app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)


// ------------------- Error Handling -------------------


// Error Handler for undefined routes
app.all('*',(req, res, next)=>{
    next(new AppError(`Can't Find ${req.originalUrl} on Server`, 404))
})


// Global Error Handler Route 
app.use((err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV == 'devlopment'){
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
            stack : err.stack,
            error : err
        })
    }
    else if(process.env.NODE_ENV == 'production'){
        console.log('done')
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
            
        })
    }
    
})

module.exports = app