import { create, find, findById, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../../../DB/DBMethods.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorHandling.js";
import slugify from 'slugify'
import { paginate } from "../../../services/pagination.js";
import subcategoryModel from "../../../../DB/model/Subcategory.model.js";

export const createSubCategory = asyncHandler(
    async (req, res, next) => {
        if (!req.file) {
            return next(new Error('Image is required', { cause: 400 }))
        } else {
            const { categoryId } = req.params;
            const category = await findById({
                filter: categoryId,
                model: categoryModel
            })
            if (!category) {
                return next(new Error('In-valid parent category Id', { cause: 404 }))
            } else {
                const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `OnlineCommerce/categories/${category._id}` })
                const { name } = req.body
                const subCategory = await create({
                    model: subcategoryModel,
                    data: {
                        name,
                        slug: slugify(name),
                        image: secure_url,
                        imagePublicId: public_id,
                        createdBy: req.user._id,
                        categoryId: category._id
                    }
                })
                return subCategory ? res.status(201).json({ message: "Done", subCategory }) :
                    next(new Error('Fail to add new Subcategory', { cause: 400 }))
            }

        }

    }
)


export const updateSubcategory = asyncHandler(
    async (req, res, next) => {

        const { categoryId, id } = req.params
        if (req.file) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `OnlineCommerce/categories/${categoryId}` })
            req.body.image = secure_url;
            req.body.imagePublicId = public_id;
        }

        if (req.body.name) {
            req.body.slug = slugify(req.body.name)
        }

        req.body.updatedBy = req.user._id

        const category = await findOneAndUpdate({
            model: subcategoryModel,
            filter: { _id: id, categoryId: categoryId },
            data: req.body,
            options: { new: false }
        })

        if (category) {
            if (req.file) {
                await cloudinary.uploader.destroy(category.imagePublicId)
            }
            return res.status(200).json({ message: "Done", category })
        }
        else {
            await cloudinary.uploader.destroy(req.body.imagePublicId)
            return next(new Error('Fail to update this subCategory', { cause: 400 }))
        }

    }
)


export const getAllsubCategories = asyncHandler(
    async (req, res, next) => {
        const { categoryId } = req.params;
        const { skip, limit } = paginate({ page: req.query.page, size: req.query.size })
        const category = await find({
            model: subcategoryModel,
            populate: [
                {
                    path: "createdBy",
                    select: "userName email image"
                },
                {
                    path: "updatedBy",
                    select: "userName email image"
                },
                {
                    path: "categoryId",
                }
            ],
            skip,
            limit
        })
        return res.status(200).json({ message: "Done", category })

    }
)


export const getSubCategoryByID = asyncHandler(
    async (req, res, next) => {
        const category = await findById({
            model: subcategoryModel,
            filter: { _id: req.params.id },
            populate: [
                {
                    path: "createdBy",
                    select: "userName email image"
                },
                {
                    path: "updatedBy",
                    select: "userName email image"
                },
                {
                    path: "categoryId",
                }
            ]
        })
        return res.status(200).json({ message: "Done", category })

    }
)

//delete