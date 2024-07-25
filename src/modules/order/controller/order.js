import Stripe from "stripe";
import { create, findByIdAndUpdate, findOne } from "../../../../DB/DBMethods.js";
import couponModel from "../../../../DB/model/coupon.model.js";
import orderModel from "../../../../DB/model/order.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import cartModel from "../../../../DB/model/cart.model.js";
import { asyncHandler } from "../../../services/errorHandling.js";
import { payment } from "../../../services/payment.js";



export const createOrder = asyncHandler(async (req, res, next) => {


    const { couponId, products } = req.body
    const { _id } = req.user//login user

    const finalList = []
    let sumTotal = 0;


    for (let i = 0; i < products.length; i++) {
        const checkItem = await findOne({
            model: productModel,
            filter: { _id: products[i].productId, stock: { $gte: products[i].quantity } }
        })
        if (!checkItem) {
            return next(new Error("In-valid to place this order", { cause: 409 }))
        }
        products[i].unitPrice = checkItem.finalPrice
        products[i].totalPrice = (checkItem.finalPrice * products[i].quantity)
        sumTotal += products[i].totalPrice
        finalList.push(products[i])
    }
    req.body.sumTotal=sumTotal
    req.body.totalPrice = sumTotal

    if (couponId) {
        const checkCoupon = await findOne({
            model: couponModel,
            filter: { _id: couponId, usedBy: { $nin: _id } }
        })
        if (!checkCoupon) {
            return next(new Error("In-valid coupon", { cause: 409 }))
        }

        req.body.totalPrice = sumTotal - (sumTotal * (checkCoupon.amount / 100))
    }

    req.body.userId = _id
    req.body.products = finalList
    const order = await create({
        model: orderModel,
        data: req.body
    })

    if (order) {
        if (couponId) {
            await findByIdAndUpdate({
                model: couponModel,
                filter: couponId,
                data: { $addToSet: { usedBy: _id } }
            })
        }

        if (order.payment == 'card') {
            const stripe = new Stripe(process.env.SRTIPE_KEY)
            if (req.body.coupon) {
                const coupon = await stripe.coupons.create({percent_off:req.body.coupon.amount , duration :'once'})
                req.body.couponId = coupon.id
            }
                 const session =  await payment({ 
                  stripe ,
                  payment_method_types : 'card' ,
                  mode :'payment' ,
                  customer_email : req.user.email ,
                  metadata : {
                      orderId :order._id.toString()
                  },
                  cancel_url : `${process.env.CANCEL_URL}?orderId=${order._id.toString()}`,
                  line_items: order.products.map(product => {
                      return {
                          price_data : {
                              currency : 'usd' ,
                              product_data :{
                                  name : product.name
                              },
                              unit_amount : product.unitPrice * 100
                          },
                          quantity : product.quantity
      
                      }
                  }),
                  discounts :req.body.couponId ? [{coupon : req.body.couponId }] : []
              })
              return res.status(201).json({ message: "Done", order , session , url : session.url })
        }

       
        return res.status(201).json({ message: "Done", order })


    } else {
        return next(new Error("Fail to place your order", { cause: 400 }))

    }


})

// export const createOrder = asyncHandler(async (req , res , next) => {

//     const {address , phone ,note , couponName ,paymentType} = req.body ;
//     if(!req.body.products){
//         const cart = await cartModel.findOne({userId : req.user._id})
//         if (!cart?.products?.length) {
//             return next(new Error( 'Empty Cart' , {cause : 400}))
//         }
//         req.body.isCart = true ;
//         req.body.products = cart.products
//     }
//     if (couponName) {
//         const coupon = await couponModel.findOne({name : couponName.toLowerCase() , usedBy :{$nin : req.user._id}})

//         if (!coupon || coupon.expireDate.getTime() < Date.now) {
//             return next(new Error( 'In-valid or expired coupon' , {cause : 400}))
//         }

//         req.body.coupon = coupon ;   
//     }

//     const productIds =[] 
//     const finalProductList = []
//     let subTotal = 0
//     for (let product of req.body.products) {

//         const checkedProduct = await productModel.findOne({
//             _id : product.productId ,
//             stock : {$gte : product.quantity} ,
//             isDeleted : false
//         })

//     }
              
// })