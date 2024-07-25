import { findByIdAndUpdate } from "../../../../DB/DBMethods.js";
import userModel from "../../../../DB/model/User.model.js";
import { asyncHandler } from "../../../services/errorHandling.js";




export const add = asyncHandler(async (req, res, next) => {
    const { productId } = req.params
    await findByIdAndUpdate({
        model: userModel,
        filter:req.user._id,
        data: { $addToSet: { wishlist: productId } }
    })
    return res.status(200).json({ message: "Done" })
})


export const remove = asyncHandler(async (req, res, next) => {
    const { productId } = req.params
    await findByIdAndUpdate({
        model: userModel,
        filter:req.user._id,
        data: { $pull: { wishlist: productId } }
    })
    return res.status(200).json({ message: "Done" })
})