import { uploadMultiImage, uploadSingleImg } from '../middleware/uploadImage.js'
import asyncHandler from "express-async-handler";
import sharp from "sharp";
import {
    createOne,
    deleteOne,
    updateOne,
    getOne,
    getAllDocuments
} from "./handler.js";

import { fileURLToPath } from 'url';
import Announcement from '../models/Announcement.js';
import { data } from 'react-router-dom';

//@ CREATE Announcement IMAGE FUNCTION
export const createAnnouncementImg = uploadSingleImg("image");

//@ CREATE  IMAGE PROCESSING FUNCTION
export const resizeImage = asyncHandler(async (req, res, next) => {

    const fileName = `Announcement${Math.random(100)}-${Date.now()}.jpeg`;
    if (req.file) {

        await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`${fileName}`);

        req.body.image = fileName;


    }

    next();


})


//create filter object
export const createFilterObj = (req, res, next) => {

    let filterObj = {};
    if (req.user._role === 'user') filterObj = { isActive: true };
    req.filterObj = filterObj;
    next();
};

//@ CREATE ALL Announcement
//@ ROUTES => POST => api/v/Announcement
//@ ACCESS => ADMIN
export const createAnnouncement = createOne(Announcement)

//@ GET ALL Announcement
//@ ROUTES => GET => api/v/Announcement
//@ ACCESS => USERS
export const getAllAnnouncement = getAllDocuments(Announcement)

//@ GET SPECIFIC Announcement
//@ ROUTES => GET  => api/v/Announcement/
//@ ACCESS => USERS

export const getAnnouncement = getOne(Announcement)
//@ UPDATE SPECIFIC Announcement
//@ ROUTES => PUT  => api/v/Announcement/
//@ ACCESS => ADMIN

export const updateAnnouncement = updateOne(Announcement)
//@ DELETE  Announcement
//@ ROUTES => DELETE => api/v/Announcement/:id
//@ ACCESS => ADMIN
export const deleteAnnouncement = deleteOne(Announcement);

//@ UPDATE  Announcement
//@ ROUTES => UPDATE => api/v/Announcement/:id
//@ ACCESS => ADMIN
export const activeAnnouncement = asyncHandler(async (req, res, next) => {
    console.log('789456123123456789')
    console.log('in active ', req.params.id)
  

    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        return res.status(404).json({ msg: "Announcement not found" });
    }

    // Toggle isActive
    announcement.isActive = !announcement.isActive;
    await announcement.save();

    res.json({ msg: "Success", data: announcement });
});

