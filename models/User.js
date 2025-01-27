
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from 'fs';

import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../utils/cloudinary.js';
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "user name is required"],
    },
    slug: {
        type: String,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "user name is required"],
        unique: [true, "email has been used"]

    },

    phone: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
    },
    cloudinaryId: {
        type: String,
    },

    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "Too short password"],
        // select: false
    },
    passwordChangeAt: {
        type: Date
    },

    passwordRestCode: {
        type: String,
    },
    passwordRestCodeExpire: {
        type: Date
    },
    passwordRestVerified: {
        type: Boolean,
        default: false
    },

    role: {
        type: String,
        enum: ['user', 'manager', 'admin'],
        default: "user"
    },
    active: {
        type: Boolean,
        default: true
    },
    // one to many 2 type child ref or parent ref => many thing => parent  && => few thing child 
    wishList: [{

        type: mongoose.Schema.ObjectId,
        ref: 'Product'
    }],
    addresses: [
        {
            id: mongoose.Schema.Types.ObjectId,
            city: String,


        }
    ]
}, { timestamps: true })


// const setimageUrl = (doc) => {
//     if (doc.profileImage) {
//         const imageUrl = `${process.env.BASE_URL}/users/${doc.profileImage}`;
//         doc.profileImage = imageUrl
//     }
// }

// // get get all 
// UserSchema.post("init", function (doc) {
//     setimageUrl(doc);
// });
// // create
// UserSchema.post("save", function (doc) {
//     setimageUrl(doc);

// });
// password hashing
UserSchema.pre('save', async function (next) {
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
        next()
    }
    next();
})

UserSchema.pre('save', async function (next) {
    if (this.profileImage) {

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
            const uploadResult = await uploadImageToCloudinary(this.profileImage);
            await fs.promises.unlink(this.profileImage)

            // Check if uploadResult is valid
            if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
                // Save public_id and secure_url from Cloudinary
                this.cloudinaryId = uploadResult.public_id;
                this.profileImage = uploadResult.secure_url;
                console.log('profile imag cloud', this.profileImage)

                next();
            } else {
                return next(new Error('Failed to upload image to Cloudinary'));
            }

        } catch (err) {
            console.error('Error uploading image to Cloudinary:', err);
            return next(err);  // Pass error to next middleware
        }
    } else {
        next();  // If profileImage is not modified, skip the upload process
    }
});

export default mongoose.model("User", UserSchema)