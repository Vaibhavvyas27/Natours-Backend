const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASS,
);

mongoose.connect(DB)
    .then(() => console.log('MongoDB Connected Succesfully......✅'))
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    })

const port = process.env.PORT || 3000;

console.log(app.get('env'));

const server = app.listen(port, () => {
    console.log(`Server is Runing of port ${port} 🚀`);
});


// Handaling Unhandale Errors

process.on('unhandledRejection', err => {
    console.log(err.name, err.message)
    console.log('UNHANDLED REJECTION ! Shutting down server...')
    server.close(() => {
        process.exit(1)
    })
})

process.on('uncaughtException', err => {
    console.log(err.name, err.message)
    console.log('UNCAUGHT EXCEPTION ! Shutting down server...')
    server.close(() => {
        process.exit(1)
    })
})