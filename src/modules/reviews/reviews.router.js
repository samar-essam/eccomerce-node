import { Router } from "express";
import * as review from './controller/review.js'
import { endPoint } from './reviews.endPoint.js'
import { auth } from '../../middleware/auth.js'

const router = Router({ mergeParams: true })

router.post('/', auth(endPoint.c), review.createReview)






export default router