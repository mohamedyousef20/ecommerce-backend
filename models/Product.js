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
      // trim: true,
      // required: [true, "product name is required"],
      // unique: [true, "product name must be unique"],
      // maxlength: [14, "too short description"],


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
      // required: [true, "product quantity required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      // required: [true, "product price required"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: {
      type: [String],
    },
    desc: {
      type: String,
      // required: [true, "product description required"],
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
  console.log(this.imageCover.includes('https'), 'is image cover uploaded to cloud')
  try {
    // Handle imageCover
    if (this.imageCover) {
      console.log(this.imageCover)
      // Check if the image is already a Cloudinary URL
      if (this.imageCover.includes('product')) {
        console.log(this.imageCover.includes('product'))
        console.log(' NO https ')
        console.log(this.imageCover)
        console.log(' NO https ')

        // Delete old imageCover from Cloudinary if it exists
        if (this.cloudinaryId) {
          await deleteImageFromCloudinary(this.cloudinaryId);
        }

        // Upload new imageCover to Cloudinary
        const uploadResult = await uploadImageToCloudinary(this.imageCover);

        if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
          this.cloudinaryId = uploadResult.public_id;
          this.imageCover = uploadResult.secure_url;
        } else {
          throw new Error('Failed to upload imageCover to Cloudinary');
        }
      }
      else {
        console.log(' np https ')

        this.images = this.imageCover;

      }
    }

    // Handle array of images
    if (this.images && this.images.length > 0) {
      const newImages = [];
      for (const image of this.images) {
        console.log('1')
        // Check if the image URL is already from Cloudinary
        if (image.url && !image.url.includes('https')) {
          // Upload new image to Cloudinary
          const uploadResult = await uploadImageToCloudinary(image.url);

          if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
            newImages.push({
              url: uploadResult.secure_url,
              cloudinaryId: uploadResult.public_id,
            });
          } else {
            throw new Error('Failed to upload an image to Cloudinary');
          }
        }
        else {
          // Keep existing Cloudinary image
          console.log(image)
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
