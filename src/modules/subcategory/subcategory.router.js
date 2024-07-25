import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import endPoint from "./subCategory.js";
import * as subCategory from './controller/subCategory.js'

const router = Router({ mergeParams: true })


router.post('/', auth(endPoint.add), myMulter(fileValidation.image).single('image'), subCategory.createSubCategory)

router.put('/:id', auth(endPoint.update), myMulter(fileValidation.image).single('image'), subCategory.updateSubcategory)

router.get('/', subCategory.getAllsubCategories)

router.get('/:id', subCategory.getSubCategoryByID)





export default router