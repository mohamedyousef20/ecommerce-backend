import express from 'express'
import { verifyToken, verifyRole } from '../controller/authController.js';

import {
    getCategoryValidator,
    createCategoryValidator,
    updateCategoryValidator,
    deleteCategoryValidator
} from '../utils/validator/categoryValidator.js'
import {
    createCategory,
    deleteCategory,
    getAllCategory,
    getCategory,
    updateCategory,
    createCateImg,
    resizeImage
} from '../controller/categoryController.js';
import subcategoryRout from './subcategoryRoute.js'
import productRoute from './productRoute.js'
// import { uploadImageToCloudinary } from '../utils/cloudinary.js';
const router = express.Router();


router.get('/:id', getCategoryValidator, getCategory);
router.get('/', getAllCategory);

// nested route
router.use('/:categoryId/subcategories', subcategoryRout)


// nested route
router.use('/:categoryId/product', productRoute)
// verifyToken, verifyRole (admin)
router.delete('/:id', deleteCategoryValidator, deleteCategory);
// verifyToken, verifyRole (admin,manager)
// router.use(verifyToken,verifyRole('admin', 'manager'))
router.post('/', createCateImg, resizeImage, createCategoryValidator, createCategory);
router.patch('/:id', createCateImg, resizeImage, updateCategoryValidator, updateCategory);
export default router