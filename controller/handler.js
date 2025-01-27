import asyncHandler from "express-async-handler";
import createError from "../utils/errors.js";
import apiFeateure from "../utils/apiFeature.js";



export const updateOne = (modelName) =>
    asyncHandler(async (req, res, next) => {
        console.log('||||||||||the request image is|||||||||| ',req.body)
        const updateOne = await modelName.findByIdAndUpdate(
            { _id: req.params.id },

            req.body,

            { new: true}
        );
        if (!updateOne) {
            return next(new createError(`No documents Found TO Update`, 404))
        }

        // trigger save event in Review model 
        updateOne.save();
        res.status(200).json({msg:'success',data:updateOne});
    });

export const createOne = (modelName) =>
    asyncHandler(async (req, res) => {
      console.log(req.body)
        const createOne = await modelName.create(req.body);
        console.log(res.status)
        res.status(201).json({msg:'success',data:createOne});
    });



export const getOne = (modelName, populateOpt) => asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // build query
    let query = modelName.findById(id);
    if (populateOpt) {
        query = query.populate(populateOpt)
    }
    // Execute query
    const getOne = await query
    if (!getOne) {
        return next(new createError('No Documents Found TO Get', 404))
    }
    res.status(200).send(getOne);
});


export const getAllDocuments = (modelName) =>
    asyncHandler(async (req, res) => {
        let filter = {};
        if (req.filterObj) { filter = req.filterObj };
        console.log(req.query)
        //Build Query
        const numberOfDocuments = await modelName.countDocuments(); // see if it should take filter
        const apiFeature = new apiFeateure(modelName.find(filter), req.query)
            .pagination(numberOfDocuments)
            .filtering()
            .sorting()
            .searching()
            .fields();

        //Execute Query
        const { mongooseQuery, paginationResult } = apiFeature;
        console.log(req.query)

        const models = await mongooseQuery;
        res.status(200).json({ numberOfDocuments: numberOfDocuments,  result: models.length, paginationResult, data: models });
    });

export const deleteOne = (modelName) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const deletedOne = await modelName.findByIdAndDelete(id);
        if (!deletedOne) {
            return next(new createError(`No Document Found To Delete`, 404));
        }
        //  trigger remove event in Review model
        deletedOne.deleteOne();
        res.status(200).send(`Success Deleting of Document`);
    });
