import sharp from "sharp";
import fs from 'fs'
import asyncHandler from "express-async-handler";
import bcrypt from 'bcrypt'
import Jwt from "jsonwebtoken";
import User from "../models/User.js";
import createError from "../utils/errors.js";
import { uploadSingleImg } from "../middleware/uploadImage.js";
import {
    deleteOne,
    updateOne,
    createOne,
    getOne,
    getAllDocuments
} from "./handler.js";
// import { uploadImageToCloudinary } from "../utils/cloudinary.js";

//@ CREATE CATEGORY IMAGE FUNCTION
export const createUserImg = uploadSingleImg("profileImage");
//@ CREATE  IMAGE PROCESSING FUNCTION
export const resizeImage = asyncHandler(async (req, res, next) => {
    const fileName = `user${Math.random(100)}-${Date.now()}.jpeg`;
    if (req.file) {
        await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg")
            .jpeg({ quality: 90 }).toFile(`${fileName}`);
        req.body.profileImage = fileName;

    }

    next();

})
//@ CREATE ALL USER
//@ ROUTES => POST => api/v/user
//@ ACCESS => ADMIN
export const createUser = createOne(User); //##=> to give permission like manager


//@ GET ALL USER
//@ ROUTES => GET => api/v/user
//@ ACCESS => ADMIN

export const getAllUser = getAllDocuments(User)
//@ GET SPECIFIC USER
//@ ROUTES => GET  => api/v/user
//@ ACCESS => ADMIN

export const getUser = getOne(User)
//@ UPDATE SPECIFIC USER
//@ ROUTES => PUT  => api/vi/user/
//@ ACCESS => ADMIN

export const updateUser = asyncHandler(async (req, res, next) => {
    const updateUser = await User.findByIdAndUpdate(
        { _id: req.params.id },

        {
            name: req.body.name,
            slug: req.body.slug,
            email: req.body.email,
            profileImage: req.body.profileImage,
            // phone: req.body.phone
        },

        { new: true }

    );
    if (!updateUser) {
        return next(new createError(`No documents Found TO Update`, 404))
    }
    res.status(200).send(updateUser);
});

//@ UPDATE SPECIFIC USER 
//@ ROUTES => PUT  => api/vi/user/
//@ ACCESS => ADMIN

export const changeUserPassword = asyncHandler(async (req, res, next) => {
    const updateOne = await User.findByIdAndUpdate(
        { _id: req.params.id },

        {
            password: await bcrypt.hash(req.body.newPassword, 10),
            passwordChangeAt: Date.now()
        },

        { new: true }

    );
    if (!updateOne) {
        return next(new createError(`No documents Found TO Update`, 404))
    }
    res.status(200).send(updateOne);
});

//@ DELETE  User
//@ ROUTES => DELETE => api/vi/User/:id
//@ ACCESS => ADMIN
export const deleteUser = deleteOne(User);
//@ GET LOGGED User
//@ ROUTES => DELETE => api/vi/user/getData/getMe
//@ ACCESS => LOGGED USER
export const getLoggedUserData = asyncHandler(
    async (req, res, next) => {
        req.params.id = req.user._id;
        next()
    }
);

//@ GET LOGGED User
//@ ROUTES => DELETE => api/vi/user/getData/getMe
//@ ACCESS => LOGGED USER

export const updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
    console.log(req.user._id)
    const updateOne = await User.findByIdAndUpdate(
        { _id: req.user._id },


        {
            password: await bcrypt.hash(req.body.password, 10),
            passwordChangeAt: Date.now()
        },

        { new: true }

    );
    const token = Jwt.sign({
        id: req.user._id

    }, process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRE_DATE });

    res.status(201).json({ data: updateOne, userToken: token })
});

export const updateLoggedUserData = asyncHandler(async (req, res, next) => {
    // Filter the fields to update dynamically
    console.log(req.body)
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.profileImage) updates.profileImage = req.body.profileImage;

    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
        return res.status(400).send({ message: 'No valid fields to update' });
    }
    console.log("req.user.id", req.user.id)

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id, // User ID from request
        updates,      // Fields to update
        { new: true, runValidators: true } // Return updated document and validate changes
    );

    // Save only if profileImage triggers middleware logic (if required)
    if (req.body.profileImage) {
        await updatedUser.save();
    }

    res.status(200).send(updatedUser);
}
)
// deactivate logged user

export const deactivateMyAccount = asyncHandler(async (req, res, next) => {

    await User.findByIdAndUpdate(
        { _id: req.user._id },
        { active: false },
        { new: true }
    )
    res.status(201).send("deactivating.....")

}

)

// activate logged user

export const activateMyAccount = asyncHandler(async (req, res, next) => {

    await User.findByIdAndUpdate(
        req.user._id,
        { active: true },
        { new: true }
    )
    res.status(201).send("activating.....")

}
)

// delete logged user
export const deleteMyAccount = asyncHandler(async (req, res, next) => {

    await User.findByIdAndDelete({ _id: req.user._id })
    res.status(201).send("deleting.....")

}
)