const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel') 
const Review = require('./../../models/reviewModel') 
const User = require('./../../models/userModel') 

dotenv.config({ path: './config.env' });
console.log(process.env.PORT);

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASS,
);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(con => console.log('MongoDB Connected Succesfully......'));


// Reading Json File ..
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))


//Insert All Data In DB 
const importAllData = async () => {
    try {
        await Tour.create(tours)
        await User.create(users, {validateBeforeSave : false})
        await Review.create(reviews)
        console.log('Data Inserted Sucessfully...')
    } catch (error) {
        console.log(error)
    }
    process.exit()
}


// Delete All Data From DB
const removeAllData = async () => {
    try {
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data Removed Sucessfully...')
    } catch (error) {
        console.log(error)
    }
    process.exit()
}

if(process.argv[2] === '--import'){
    importAllData();
}
else if(process.argv[2] === '--remove'){
    removeAllData()
}


console.log(process.argv)