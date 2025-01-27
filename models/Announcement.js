import mongoose from "mongoose";
import fs from 'fs';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../utils/cloudinary.js";
// import { uploadImageToCloudinary } from "../utils/cloudinary.js";
// create schema
const AnnouncementSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        minlength: [2, 'too short'],
        maxlength: [32, 'too long']

    },


    image: {
        type: String
    },

    cloudinaryId: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true

    },
    desc: {
        type: String,

    }


}, { timestamps: true });




AnnouncementSchema.pre('save', async function (next) {

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

        console.log('dddd',this.image)
        try {
            // Upload new image to Cloudinary
            const uploadResult = await uploadImageToCloudinary(this.image);
          await fs.promises.unlink(this.image)

            // Check if uploadResult is valid
            if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
                // Save public_id and secure_url from Cloudinary
                this.cloudinaryId = uploadResult.public_id;
                this.image = uploadResult.secure_url;
             

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
export default mongoose.model('Announcement', AnnouncementSchema)

