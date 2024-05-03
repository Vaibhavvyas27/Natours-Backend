const cloudinary = require('cloudinary').v2;
const catchAsync = require('./catchAsync');
const fs = require('fs')
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRATE 
});

exports.uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const uploadresponce = await cloudinary.uploader.upload(localFilePath);
        fs.unlinkSync(localFilePath);
        return uploadresponce.secure_url
    } catch (error) {
        console.log(error)
    }
}