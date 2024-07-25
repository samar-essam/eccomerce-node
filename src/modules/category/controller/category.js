import {
  create,
  find,
  findById,
  findByIdAndUpdate,
  findOne,
} from "../../../../DB/DBMethods.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorHandling.js";
import slugify from "slugify";
import { paginate } from "../../../services/pagination.js";
import subcategoryModel from "../../../../DB/model/Subcategory.model.js";

export const createCategory = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new Error("Image is required", { cause: 400 }));
  } else {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "OnlineCommerce/categories" }
    );
    const { name } = req.body;
    const category = await create({
      model: categoryModel,
      data: {
        name,
        slug: slugify(name),
        image: secure_url,
        imagePublicId: public_id,
        createdBy: req.user._id,
      },
    });
    console.log(category);
    return category
      ? res.status(201).json({ message: "Done", category })
      : next(new Error("Fail to add newCategory", { cause: 400 }));
  }
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const category = await findById({
    model: categoryModel,
    filter: { _id: id },
  });

  if (req.file) {
    await cloudinary.uploader.destroy(category.imagePublicId);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "OnlineCommerce/categories" }
    );
    req.body.image = secure_url;
    req.body.imagePublicId = public_id;
  }

  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }

  req.body.updatedBy = req.user._id;

  const nCategory = await findByIdAndUpdate({
    model: categoryModel,
    filter: { _id: id },
    data: req.body,
    options: { new: true },
  });

  return nCategory
    ? res.status(200).json({ message: "Done", nCategory })
    : next(new Error("Fail to update this Category", { cause: 400 }));
});

export const getAllCategories = asyncHandler(async (req, res, next) => {
  const { skip, limit } = paginate({
    page: req.query.page,
    size: req.query.size,
  });

  const category = await find({
    model: categoryModel,
    populate: [
      {
        path: "createdBy",
        select: "userName email image",
      },
      {
        path: "updatedBy",
        select: "userName email image",
      },
      {
        path: "subCategory",
      },
    ],
    skip,
    limit,
  });

  return res.status(200).json({ message: "Done", category });
});

export const getCategoryByID = asyncHandler(async (req, res, next) => {
  const category = await findById({
    model: categoryModel,
    filter: { _id: req.params.id },
    populate: [
      {
        path: "createdBy",
        select: "userName email image",
      },
      {
        path: "updatedBy",
        select: "userName email image",
      },
    ],
  });
  return res.status(200).json({ message: "Done", category });
});

//delete
