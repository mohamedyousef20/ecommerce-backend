import { uploadSingleImg } from '../middleware/uploadImage.js'
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import path, { dirname } from 'path';
import {
    createOne,
    deleteOne,
    updateOne,
    getOne,
    getAllDocuments
} from "./handler.js";
import Category from "../models/Category.js";
// import { uploadImageToCloudinary, deleteImageFromCloudinay } from "../utils/cloudinary.js";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//@ CREATE CATEGORY IMAGE FUNCTION
export const createCateImg = uploadSingleImg("image");

//@ CREATE  IMAGE PROCESSING FUNCTION
export const resizeImage = asyncHandler(async (req, res, next) => {

    const fileName = `category${Math.random(100)}-${Date.now()}.jpeg`;
    if (req.file) {

        await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`${fileName}`);
        // // IMAGE PATH
        // const imagePath = `uploads/${fileName}`
        req.body.image = fileName;
        // // FUNCTION TO UPLOAD IMAGES TO CLOUDINARY
        // const result = await uploadImageToCloudinary(imagePath);

        // //  SAVE IMAGE INTO DB    
        // req.body.image = [
        //     {imagePublicId: result.public_id,
        //     imageUrl: result.secure_url }
        //    ];




        // // req.body.imageUrl = result.secure_url;
        // req.body.imagePublicId = result.public_id;
        // REMOVE IMAGES FROM THE SERVER
        // fs.unlinkSync(imagePath)

    }








    next();
})

//@ CREATE ALL CATEGORY
//@ ROUTES => POST => api/v/category
//@ ACCESS => ADMIN
export const createCategory = createOne(Category)

//@ GET ALL CATEGORY
//@ ROUTES => GET => api/v/category
//@ ACCESS => USERS
export const getAllCategory = getAllDocuments(Category)

//@ GET SPECIFIC CATEGORY
//@ ROUTES => GET  => api/v/category/
//@ ACCESS => USERS

export const getCategory = getOne(Category)
//@ UPDATE SPECIFIC CATEGORY
//@ ROUTES => PUT  => api/v/category/
//@ ACCESS => ADMIN

export const updateCategory = updateOne(Category)
//@ DELETE  CATEGORY
//@ ROUTES => DELETE => api/v/category/:id
//@ ACCESS => ADMIN
export const deleteCategory = deleteOne(Category);


