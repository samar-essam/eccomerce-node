import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import endPoint from "./category.endPoint.js";
import * as category from './controller/category.js'
import subcategoryRouter from "../subcategory/subcategory.router.js";

const router = Router()


router.use('/:categoryId/subCategory', subcategoryRouter)

router.post('/', auth(endPoint.add), myMulter(fileValidation.image).single('image'), category.createCategory)

router.put('/:id', auth(endPoint.update), myMulter(fileValidation.image).single('image'), category.updateCategory)

router.get('/', category.getAllCategories)

router.get('/:id', category.getCategoryByID)





export default router