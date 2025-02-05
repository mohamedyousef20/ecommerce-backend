import sharp from "sharp";
import fs from 'fs'
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { uploadMultiImage } from "../middleware/uploadImage.js";
import { deleteOne, updateOne, createOne, getAllDocuments, getOne } from "./handler.js";

//## => Create Image
export const uploadProductImages = uploadMultiImage([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 4 }])

//## => Create  Image Processing Function 
export const resizeImage = asyncHandler(async (req, res, next) => {
    // Handle imageCover
    if (req.files.imageCover) {
        // Process new file upload
        const fileName = `product${Math.random(100)}-${Date.now()}_cover_img.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(1200, 1300)
            .toFormat("jpeg")
            .jpeg({ quality: 100 })
            .toFile(`${fileName}`);

        req.body.imageCover = fileName;
    } else if (req.body.imageCover && req.body.imageCover.startsWith('http')) {
        // If it's a cloud URL, pass it through as is
        req.body.imageCover = req.body.imageCover;
    }

    // Handle product images
    if (req.files.images) {
        req.body.images = [];
        await Promise.all(req.files.images.map(async (img) => {
            const fileName = `product${Math.random(100)}-${Date.now()}.jpeg`;
            await sharp(img.buffer)
                .resize(1200, 1300)
                .toFormat("jpeg")
                .jpeg({ quality: 100 })
                .toFile(`${fileName}`);
            
            req.body.images.push({
                url: fileName
            });
        }));
    } else if (req.body.images) {
        // If images are provided as URLs in the request body
        req.body.images = req.body.images.map(img => {
            if (typeof img === 'string' && img.startsWith('http')) {
                return { url: img };
            }
            return img;
        });
    }

    next();
})

export const createFilterObj = (req, res, next) => {
    let filterObj = {};
    if (req.params.categoryId) filterObj = { category: req.params.categoryId };
    req.filterObj = filterObj;
    next()
}
//## => CREATE => Product
//## => ROUTES => POST => api/vi/Product
//## => ACCESS => ADMIN 
export const createProduct = createOne(Product)

//## => GET => All Product
//## => ROUTES => GET => api/vi/Product
//## => ACCESS => USERS
export const getAllProduct = getAllDocuments(Product)


//## => GET => Specific Product
//## => ROUTES => GET  => api/vi/product
//## => ACCESS => USERS

export const getProduct = getOne(Product, 'reviews');

//## => UPDATE => Specific Product
//## => ROUTES => PUT => api/vi/product
//## => ACCESS => ADMIN

export const updateProduct = updateOne(Product)
//## => DELETE => Product
//## => ROUTES => DELETE => api/vi/product/:id
//## => ACCESS => ADMIN
export const deleteProduct = deleteOne(Product);