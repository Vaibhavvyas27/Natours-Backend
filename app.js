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
const csurf = require('csurf')
const app = express()

app.use(cookieParser())

const corsOptions ={
    origin:['http://localhost:5173','https://dev-natours-vv.netlify.app'],
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
    methods: ['POST', 'PUT', 'PATCH', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
}
app.use(cors(corsOptions));



// const csrfProtection = csurf({ cookie: true });

// app.use(csrfProtection);  // Apply CSRF protection globally or to specific routes

// app.get('/csrf-token', (req, res) => {
//   // Send the token to the frontend so it can be included in API requests
//   console.log(req.csrfToken())
//   res.json({ csrfToken: req.csrfToken() });
// });


// app.use((err, req, res, next) => {
//     if (err.code === 'EBADCSRFTOKEN') {
//       // CSRF token invalid or missing
//       res.status(403).json({
//         error: 'CSRF token invalid or missing',
//         message: 'Form tampered with',
//       });
//     } else {
//       next(err);
//     }
//   });


// Bypass the ssl certificate verification   :->  __NOTE__ : Not Recommend in production 
// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0 


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
    // console.log(req)
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