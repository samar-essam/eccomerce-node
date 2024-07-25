import { create, find, findById, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../../../DB/DBMethods.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/errorHandling.js";
import slugify from 'slugify'
import { paginate } from "../../../services/pagination.js";
import brandModel from "../../../../DB/model/Brand.model.js";
import subcategoryModel from "../../../../DB/model/Subcategory.model.js";
import productModel from "../../../../DB/model/Product.model.js";

const populate = [
    {
        path: "createdBy",
        select: "userName email image"
    },
    {
        path: "updatedBy",
        select: "userName email image"
    },
    {
        path: "categoryId",
        populate: {
            path: "createdBy",
            select: "userName email image"
        }
    },
    {
        path: "subcategoryId",
        populate: {
            path: "createdBy",
            select: "userName email image"
        }
    },
    {
        path: "brandId",
        populate: {
            path: "createdBy",
            select: "userName email image"
        }
    }
    
]

export const createProduct = asyncHandler(
    async (req, res, next) => {
        if (!req.files?.length) {
            return next(new Error('Images is required', { cause: 400 }))
        } else {
           
          const  {name ,amount , discount , price , subcategoryId, categoryId, brandId } = req.body
            if(name){
                req.body.slug = slugify(name)
            }
            req.body.stock = amount 
            if (discount) {
                req.body.finalPrice = price - ( price * ( (discount || 0 ) / 100) )
            }
            const category = await findOne({
                model : subcategoryModel ,
                filter : {_id : subcategoryId , categoryId}
            })
            if (!category) {
                return next(new Error('In-valid category or sub category ids', { cause: 404 }))
            }
            const brand = await findOne({
                model : brandModel ,
                filter : {_id : brandId }
            })
            if (!brand) {
                return next(new Error('In-valid brand ', { cause: 404 }))
            }
            const images = []
            const imagePublicIds = []
            for (const file of req.files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `OnlineCommerce/products/${name}` })
                images.push(secure_url)
                imagePublicIds.push(public_id)
            }

            req.body.images = images
            req.body.imagePublicIds = imagePublicIds
            req.body.createdBy = req.user._id

            const product = await create({
                model : productModel ,
                data : req.body 
            })
           return res.status(201).json({message : "Done" , product})

            }

        }

    
)


export const updateProduct = asyncHandler(
    async (req, res, next) => {
        const {id } = req.params
        const product = await findById({
            model : productModel ,
            filter : id
        })
        if (!product) {
            next(new Error("In-Valid product Id 🤨"))
        }
        const {name , amount , price , discount , soldItems , categoryId, subcategoryId, brandId } = req.body
        if (name) {
            req.body.slug = slugify(name)
            
        }
        if (amount & soldItems) {
            const calStock = amount - soldItems
            calStock > 0 ? req.body.stock = calStock : req.body.stock = 0
        }else if(amount){
            const calStock = amount - product.soldItems
            calStock > 0 ? req.body.stock = calStock : req.body.stock = 0
        }else if (soldItems) {
            const calStock = product.amount - soldItems
            calStock > 0 ? req.body.stock = calStock : req.body.stock = 0
        }


        if (price & discount) {
            req.body.finalPrice = price - ( price * ( (discount || 0 ) / 100) )
        }else if(price){
            req.body.finalPrice = price - ( price * ( (product.discount || 0 ) / 100) )
        }else if (discount) {
            req.body.finalPrice = product.price - ( product.price * ( (discount || 0 ) / 100) )
        }

        if (categoryId && subcategoryId) {
            const category = await findOne({
                model: subcategoryModel,
                filter: { _id: subcategoryId, categoryId }
            }) //{} , null
            if (!category) {
                return next(new Error('In-valid category or sub category ids', { cause: 404 }))
            }

        }

        if (brandId) {
            const brand = await findOne({
                model: brandModel,
                filter: { _id: brandId }
            }) //{} , null
            if (!brand) {
                return next(new Error('In-valid brand id', { cause: 404 }))
            }
        }

        req.body.updatedBy = req.user._id

        if (req.files.length) {
            const images = []
            const imagePublicIds = []
            for (const file of req.files) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `OnlineCommerce/products/${name}` })
                images.push(secure_url)
                imagePublicIds.push(public_id)
            }
            req.body.imagePublicIds = imagePublicIds
            req.body.images = images
        }

        const updateProduct = await findOneAndUpdate({
            model: productModel,
            data: req.body,
            filter: { _id: product._id },
            options: { new: true }
        })

        if (updateProduct) {
            for (const imageID of product.imagePublicIds) {
                await cloudinary.uploader.destroy(imageID)
            }
            return res.status(200).json({ message: "Done", updateProduct })
        } else {
            return next(new Error(`fail to update  product with  ID : ${product._id}`, { cause: 400 }))
        }

    }
)

export const products = asyncHandler(
    async(req , res , next) => {

      const {limit , skip} = paginate({page : req.query.page , size :req.query.size})
        const productList = await find({
            model : productModel ,
            filter : {} ,
            populate : populate,
            skip ,
            limit
        })
        res.status(200).json({ message :"Done" , data : productList})
    }
)

export const getProductById = asyncHandler(
    async(req , res , next) => {
        const { id } = req.params
        const productList = await findById({
            model : productModel ,
            filter : id ,
            populate : populate,
            
        })
        res.status(200).json({ message :"Done" , data : productList})
    }
)





//delete