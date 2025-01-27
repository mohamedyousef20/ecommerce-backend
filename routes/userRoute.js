import express from 'express'
import { verifyToken, verifyRole } from '../controller/authController.js';

import {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changePasswordValidator,
  updateLoggedUserValidator,

} from '../utils/validator/userValidator.js'
import {
  createUser,
  deleteUser,
  getAllUser,
  getUser,
  getLoggedUserData,
  updateUser,
  resizeImage,
  createUserImg,
  changeUserPassword,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deactivateMyAccount,
  activateMyAccount,
  deleteMyAccount
} from "../controller/userController.js";

const router = express.Router();

// logged user 
router.use(verifyToken)
router.get('/getData/getMe', getLoggedUserData, getUser);
router.patch('/changeMyPassword', updateLoggedUserPassword);
//#TODO can case error 
// router.patch('/updateUserData', createUserImg, resizeImage ,updateLoggedUserValidator, updateLoggedUserData)
router.patch('/updateUserData', createUserImg, resizeImage, updateLoggedUserData)
router.patch('/deactivateMyAccount', deactivateMyAccount)
router.delete('/activeMyAccount', activateMyAccount)
router.delete("/deleteMyAccount", deleteMyAccount);


// Admin Role
// router.use(verifyRole('admin'))
// router.post('/', createUserImg, resizeImage, createUserValidator, createUser);
router.post('/', createUserImg, resizeImage, createUser);
router.get('/:id', getUserValidator, getUser);
router.patch('/:id', createUserImg, resizeImage, updateUserValidator, updateUser);
router.delete('/:id', deleteUserValidator, deleteUser);
router.get('/', getAllUser);
router.patch("/changePassword/:id", changePasswordValidator, changeUserPassword);

export default router