import { roles } from "../../middleware/auth.js";



export const endPoint = {
    createCoupon: [roles.Admin],
    updateCoupon: [roles.Admin],
    deleteCoupon: [roles.Admin]
}