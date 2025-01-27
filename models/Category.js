import mongoose from "mongoose";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../utils/cloudinary.js";
// import { uploadImageToCloudinary } from "../utils/cloudinary.js";
import fs from 'fs'

// create schema
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'category is required'],
        unique: [true, 'category is must be unique'],
        minlength: [2, 'too short'],
        maxlength: [32, 'too long']

    },
    slug: {
        type: String,
        lowercase: true
    },


    image: {
        type: String,
        required:true
    },


    cloudinaryId: {
        type: String,
        // required: true
    },



}, { timestamps: true });



CategorySchema.pre('save', async function (next) {
    if (this.image && this.isModified('image')) {

        // If there's an old image and the image URL is modified, delete the old one from Cloudinary
        if (this.cloudinaryId) {
            try {
                await deleteImageFromCloudinary(this.cloudinaryId);
            } catch (err) {
                console.error('Error deleting image from Cloudinary:', err);
                return next(err);  // Pass error to next middleware
            }
        }

        try {
            // Upload new image to Cloudinary
            const uploadResult = await uploadImageToCloudinary(this.image);
            await fs.promises.unlink(this.image)

            // Check if uploadResult is valid
            if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
                // Save public_id and secure_url from Cloudinary
                this.cloudinaryId = uploadResult.public_id;
                this.image = uploadResult.secure_url;
                // console.log('profile imag cloud', this.image);

                next();
            } else {
                return next(new Error('Failed to upload image to Cloudinary'));
            }

        } catch (err) {
            console.error('Error uploading image to Cloudinary:', err);
            return next(err);  // Pass error to next middleware
        }
    } else {
        next();  // If image is not modified, skip the upload process
    }
});



// create and export model
export default mongoose.model('Category', CategorySchema)

