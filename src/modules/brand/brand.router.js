import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import endPoint from "./brand.endPoint.js";
import * as brand from './controller/brand.js'

const router = Router({})


router.post('/', auth(endPoint.add), myMulter(fileValidation.image).single('image'), brand.createBrand)

router.put('/:id', auth(endPoint.update), myMulter(fileValidation.image).single('image'), brand.updateBrand)

router.get('/' , brand.Brands)

export default router