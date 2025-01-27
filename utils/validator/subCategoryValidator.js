import { check } from 'express-validator';
import slugify from 'slugify';
import validator from '../../middleware/validator.js';
import SubCategory from '../../models/SubCategory.js';
import createError from '../errors.js';


export const createSubCateValid = [
    check('name').notEmpty()
        .withMessage('category is name required ')
        .isLength({ min: 2 })
        .withMessage('too short category name')
        .isLength({ max: 20 })
        .withMessage('too long category name')
        .custom((val, { req }) => req.body.slug = slugify(val)).custom((val,{req})=>{
           return SubCategory.findOne({name:val}).then((subcategory)=>{
                if(subcategory){
                    return Promise.reject(new createError('subcategory name already in use', 400))
                }
            })
        }),
    check('category').notEmpty()
        .withMessage('sub category must belonge to any category')
        .isMongoId().
        withMessage('invalid mongo ID'),
    validator
];
export const getSubCategoryValidator = [
    check('id').isMongoId().withMessage('invalid Subcategory ID'),
    validator

];

export const updateSubCategoryValidator = [
    check('id').isMongoId().withMessage('invalid Subcategory ID'),
    check('category').optional().isMongoId().withMessage('invalid mongo ID category'),
    check('name').optional().isString().withMessage('inavalid name.... ')
        .custom((val, { req }) => req.body.slug = slugify(val)),

    validator

];
export const deleteSubCategoryValidator = [
    check('id').isMongoId().withMessage('invalid Subcategory ID'),
    validator

];

