import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./wishlist.endpoint.js";
import * as wishlist  from './controller/wishlist.js'

const router = Router({ mergeParams: true })




router.patch("/add" , auth(endPoint.add)  ,  wishlist.add )
router.patch("/remove" , auth(endPoint.remove)  ,  wishlist.remove )






export default router
