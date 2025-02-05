import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary
} from "../utils/cloudinary.js";
import createError from "../utils/errors.js";
import expressAsyncHandler from "express-async-handler";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "product name is required"],


    },
    slug: {
      type: String,
      lowercase: true,
    },


    imageCover: {
      type: String,
      required: true
    },
    cloudinaryId: {
      type: String,
      // required: true
    },

    images: [
      {
        url: String,
        // cloudinaryId: String,
      },
    ],

    quantity: {
      type: Number,
      required: [true, "product quantity required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price required"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: {
      type: [String],
    },
    desc: {
      type: String,
      required: [true, "product description required"],
      minlength: [20, "too short description"],
    },
    ratingsAverage: {
      type: Number,
      min: 1,
      max: 5,
    },
    numberOfRating: {
      type: Number,
      default: 0,
    },
    category: {

      type: mongoose.Schema.ObjectId,
      ref: "Category",
      // required: [true, "required category name"],
    },
    subCategory: {
      type: [mongoose.Schema.ObjectId],
      ref: "SubCategory",
    },
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name ",
  });
  next();
});

ProductSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// // create
ProductSchema.pre('save', async function (next) {
  try {
    // Validate imageCover
    if (this.imageCover && typeof this.imageCover === 'string') {
      console.log(this.imageCover.includes('https'), 'is image cover uploaded to cloud');

      // Check if the image is already a Cloudinary URL
      if (!this.imageCover.includes('https')) {
        console.log('Image is not a Cloudinary URL, uploading to Cloudinary...');

        // Delete old imageCover from Cloudinary if it exists
        if (this.cloudinaryId) {
          await deleteImageFromCloudinary(this.cloudinaryId);
        }

        // Upload new imageCover to Cloudinary
        const uploadResult = await uploadImageToCloudinary(this.imageCover);

        if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
          this.cloudinaryId = uploadResult.public_id;
          this.imageCover = uploadResult.secure_url;

          // Delete the local file after uploading to Cloudinary
          if (fs.existsSync(this.imageCover)) {
            await fs.promises.unlink(this.imageCover);
          }
        } else {
          throw new Error('Failed to upload imageCover to Cloudinary');
        }
      } else {
        console.log('Image is already a Cloudinary URL, skipping upload.');
      }
    }

    // Validate and process images array
    if (this.images && Array.isArray(this.images) && this.images.length > 0) {
      const newImages = [];
      for (const image of this.images) {
        if (image.url && typeof image.url === 'string' && !image.url.includes('https')) {
          console.log('Uploading image to Cloudinary:', image.url);

          // Upload new image to Cloudinary
          const uploadResult = await uploadImageToCloudinary(image.url);

          if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
            newImages.push({
              url: uploadResult.secure_url,
              cloudinaryId: uploadResult.public_id,
            });

            // Delete the local file after uploading to Cloudinary
            if (fs.existsSync(image.url)) {
              await fs.promises.unlink(image.url);
            }
          } else {
            throw new Error('Failed to upload an image to Cloudinary');
          }
        } else {
          console.log('Image is already a Cloudinary URL or invalid, skipping upload:', image.url);
          newImages.push(image);
        }
      }

      // Update the images array with the new data
      this.images = newImages;
    }

    next();
  } catch (err) {
    console.error('Error in pre-save middleware:', err);
    next(err);
  }
});

export default mongoose.model("Product", ProductSchema);
