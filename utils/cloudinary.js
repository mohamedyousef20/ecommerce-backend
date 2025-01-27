import { v2 as cloudinary } from 'cloudinary';
import asyncHandler from "express-async-handler";

cloudinary.config({
    cloud_name: 'dkmrrisek',
    api_key: '579668224964754',
    api_secret: 'iaIceTjCo9IZ4dX7xb94Klz37VU' // Click 'View API Keys' above to copy your API secret
});
// Upload an image in cloudinary

export const uploadImageToCloudinary = asyncHandler(async (fileToUpload) => {
    console.log('ge tin ')
    console.log(fileToUpload)
    const result = await cloudinary.uploader.upload(fileToUpload,{
        resource_type: 'auto', // Allows Cloudinary to determine the type (image, video, etc.)
  });
    console.log('im correct')

// Return the result, containing the public_id and secure_url
return result;
});

// delete an image in cloudinary

export const deleteImageFromCloudinary = asyncHandler(async (imagePublicId) => {
    try {
        const data = await cloudinary.uploader.destroy(imagePublicId);
        console.log('Image Deleted Successfully From Cloudinary');
        return data;
    } catch (err) {
        console.error('Error deleting image from Cloudinary:', err);
    }
});