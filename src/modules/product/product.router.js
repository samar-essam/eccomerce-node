import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import endPoint from "./product.endPoint.js";
import * as product from './controller/product.js'
import wishlistRouter from '../wishlist/wishlist.router.js'
import reviewRouter from '../reviews/reviews.router.js'

const router = Router({})

router.use('/:productId/wishList' , wishlistRouter)
router.use('/:productId/review' , reviewRouter)

router.post('/', auth(endPoint.add), myMulter(fileValidation.image).array('images'), product.createProduct)

router.put('/:id', auth(endPoint.update), myMulter(fileValidation.image).array('images'),product.updateProduct)

router.get('/' , product.products)

router.get('/:id' , product.getProductById)





export default router