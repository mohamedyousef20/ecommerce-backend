import multer from "multer";
// import { uploadImageToCloudinary , deleteImageFromCloudinay } from "../utils/cloudinary.js";
import createError from "../utils/errors.js";


// upload single image
export const uploadSingleImg = (imageFile) => {
  console.log(imageFile)
    const multerStorage = multer.memoryStorage();
    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith('image')) {
            cb(null, true)
        }
        else {
            cb(new createError('accepting only image', 400, false))
        }
    }
    //@ CREATE  IMAGE DESTINATION 
    const upload = multer({ storage: multerStorage, fileFilter: multerFilter })




    //@ CREATE IMAGE 
    return upload.single(imageFile);


};







// upload multi images
export const uploadMultiImage = (fields) => {
  console.log(fields)

  const multerStorage = multer.memoryStorage();
  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new createError("accepting only image", 400, false));
    }
  };





  //@ CREATE CATEGORY IMAGE DESTINATION
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload.fields(fields);
};


