import express from 'express'
import { verifyToken, verifyRole } from '../controller/authController.js';
import {
    createAnnouncement,
    deleteAnnouncement,
    getAllAnnouncement,
    updateAnnouncement,
    resizeImage,
    createFilterObj,
    getAnnouncement,
    createAnnouncementImg,
    activeAnnouncement

} from '../controller/announcementController.js';
import { activateMyAccount } from '../controller/userController.js';

const router = express.Router();

// verifyToken, verifyRole
// router.use(verifyToken)
router.get("/", getAllAnnouncement);

// router.use(verifyToken, verifyRole('admin', 'manager'));


router.post("/", createAnnouncementImg, resizeImage, createAnnouncement);
router.patch('/:id', createAnnouncementImg, resizeImage, updateAnnouncement);
router.patch('/active/:id', activeAnnouncement);
router.get('/:id', getAnnouncement);
router.delete("/:id", deleteAnnouncement);



export default router