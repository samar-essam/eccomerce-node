import { Router } from "express";
import userModel from "../../../DB/model/User.model.js";
import { auth } from "../../middleware/auth.js";
import { endPoint } from "./user.endPoint.js";
const router = Router()




router.get('/', auth(endPoint.profile), async (req, res) => {
    const user = await userModel.findById(req.user._id).populate("wishlist")
    return res.status(200).json({ message: `Done`, user })
})




export default router