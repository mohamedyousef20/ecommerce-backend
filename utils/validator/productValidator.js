import { check } from 'express-validator';
import slugify from 'slugify';
import validator from '../../middleware/validator.js';
import Category from '../../models/Category.js'
import SubCategory from '../../models/SubCategory.js'


export const createProductValidator = [
    check('name').notEmpty().withMessage('Product is name required ')
        .isString().withMessage('im the wrong')
        .custom((val, { req }) => req.body.slug = slugify(val)),


    check('imageCover').notEmpty()
        .withMessage('imageCover must have cover image'),


    check('image')
        .optional()
        .isArray().withMessage('image must be array'),


    check('quantity').notEmpty().withMessage('im the wrong').isNumeric()
        .withMessage('quantity must insert numeric quantity'),


    check('sold').optional().isNumeric()
        .withMessage('sold must be number'),


    check('price').notEmpty().withMessage('im the wrong').isNumeric().toFloat()
        .withMessage('price must insert numeric price'),


    check('priceAfterDiscount').optional().isNumeric().toFloat()
        .withMessage('priceAfterDiscount must be number').custom((value, { req }) => {
            if (req.body.price <= value) { throw new Error('invalid discount') }
            return true;
        }).withMessage('priceAfterDiscount < price'),


    check('desc').notEmpty()
        .withMessage('Product desc required ').isString()
        .isLength({ min: 20 }).withMessage('too short desc'),


  check('colors').notEmpty().
        withMessage('one color needed '),


    check('rating').optional().isNumeric()
        .withMessage("rating must be numeric")
        .isLength({ min: 1 })
        .withMessage("min must =1")
        .isLength({ max: 5 })
        .withMessage(" 5 limit max"),


    check('ratingAverage').optional()
        .isNumeric()
        .withMessage("ratingAverage must be numeric")
        .isLength({ min: 1 })
        .withMessage("min must =1")
        .isLength({ max: 5 })
        .withMessage(" 5 limit max"),


    check('category').notEmpty()
        .withMessage('must belong to category')
        .isMongoId()
        .withMessage('invalid mongo ID of category')
        .custom(async (categoryId) => {
            const category = await Category.findById(categoryId);
            if (!category) {
                return Promise.reject((`No category for this is${categoryId}`));
            }
        }),



    check('subCategory')
        .optional()
        .isMongoId()
        .withMessage('invalid mongo ID of subCategory')
        .custom(async (subCategoryId) => {
            const subCategoryInDB = await SubCategory.find({ _id: { $exists: true, $in: subCategoryId } });
            if (subCategoryInDB.length == 0 || subCategoryInDB.length != subCategoryId.length) {
                return Promise.reject((`One or More of subcategory ID may be worng is${subCategoryId}`));

            }
        }).custom(async (subCategoryId, { req }) => { 
            const subCategoryInCategory = await SubCategory.find({ category: req.body.category });
            const subCategoryIdInCategory = [];
            subCategoryInCategory.forEach(el => {  
                subCategoryIdInCategory.push(el._id.toString());
            });
            const checker =subCategoryId.every((val) => {
            return subCategoryIdInCategory.includes(val);
            
            })
            if (!checker) {
              return  Promise.reject(new Error('No subcategory belong to category '))
            }
        }),



    check('brand')
        .optional()
        .isMongoId()
        .withMessage('invalid mongo ID of brand'),


    validator
];
export const getProductValidator = [
    check('id').isMongoId().withMessage('invalid Product ID'),
    validator

];

export const updateProductValidator = [
  check("id").isMongoId().withMessage("invalid Product ID"),

  check("name")
    .optional()
    .isString()
    .withMessage("invalid Product name")
    .custom((val, { req }) => (req.body.slug = slugify(val))),

  check("imageCover").optional(),

  check("image").optional().isArray().withMessage("image must be array"),

  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("quantity must insert numeric quantity"),
  check("sold")
    .optional()
    .isNumeric()

    .withMessage("sold must be number"),

  check("price")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("price must insert numeric price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .toFloat()
    .withMessage("priceAfterDiscount must be number")
    .custom((value, { req }) => {
      if (value > req.body.price) { 
        throw new Error("priceAfterDiscount must be less than price");
      }
      return true;
    }),

  check("desc")
    .optional()
    .isString()
    .withMessage("desc must be string")
    .isLength({ min: 20 })
    .withMessage("too short desc"),

  check("colors").optional(),

  check("rating")
    .optional()
    .isNumeric()
    .withMessage("rating must be numeric")
    .isLength({ min: 1 })
    .withMessage("min must =1")
    .isLength({ max: 5 })
    .withMessage(" 5 limit max"),

  check("ratingAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingAverage must be numeric")
    .isLength({ min: 1 }) // buge
    .withMessage("min must =1")
    .isLength({ max: 5 }) // buge
    .withMessage(" 5 limit max"),

  check("category")
    .optional()
    .isMongoId()
    .withMessage("invalid mongo ID of category"),

  check("subCategory")
    .optional()
    .isMongoId()
    .withMessage("invalid mongo ID of subCategory"),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("invalid mongo ID of brand"),

  validator,
];
export const deleteProductValidator = [
    check('id').isMongoId().withMessage('invalid Product ID'),
    validator

];

