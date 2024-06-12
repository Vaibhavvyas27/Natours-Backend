const cloudinary = require('cloudinary').v2;
const catchAsync = require('./catchAsync');
const fs = require('fs')
          
cloudinary.config({ 
  cloud_name: 'dhkasy82t', 
  api_key: '742615634715973', 
  api_secret: 'ODvjBf0Xx7BjoMSqGxUjf6fpqMU',
});

exports.uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const uploadresponce = await cloudinary.uploader.upload(localFilePath);
        fs.unlinkSync(localFilePath);
        return uploadresponce.secure_url
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log(error)
    }
}