import express from 'express'
import { verifyToken, verifyRole } from '../controller/authController.js';

import {
    getProductValidator,
    createProductValidator,
    updateProductValidator,
    deleteProductValidator
} from '../utils/validator/productValidator.js'
import {
    createProduct,
    deleteProduct,
    getAllProduct,
    getProduct,
    updateProduct,
    uploadProductImages,
    resizeImage,
    createFilterObj
} from '../controller/productController.js';
import reviewRoute from './reviewRoute.js'
const router = express.Router({mergeParams:true});

// //## => Nested Route
router.use("/:productId/review", reviewRoute);

//## => GET => Specific Product
//## => ACCESS => USERS
router.get('/:id', getProductValidator, getProduct);

// //## => GET => All Product
// //## => ACCESS => USERS
router.get("/", createFilterObj ,getAllProduct);

// //## => verifyToken && verifyRole 
// //## => DELETE => Specific Product
// //## => ACCESS => ADMIN

router.use(verifyToken,verifyRole("admin"))

router.delete('/:id',deleteProductValidator, deleteProduct);

// //## =>verifyToken && verifyRole 
// //## => GET => Specific Product
// //## => ACCESS => ADMIN && MANAGER
router.use(uploadProductImages, resizeImage)
router.post('/',createProductValidator, createProduct);
router.patch('/:id', updateProductValidator, updateProduct);

//## => Export Route

export default router