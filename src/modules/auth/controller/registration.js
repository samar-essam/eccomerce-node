import bcrypt from 'bcryptjs'
// import { link } from 'joi'
import jwt from 'jsonwebtoken'
import { findOne, findOneAndUpdate } from '../../../../DB/DBMethods.js'
import userModel from '../../../../DB/model/User.model.js'
import { sendEmail } from '../../../services/email.js'
// import asyncHandler from 'express-async-handler'
import { asyncHandler } from '../../../services/errorHandling.js'


export const signup = asyncHandler (
    async (req , res , next) => {
        
            const { userName , email , password } = req.body ;
            const user = await userModel.findOne({email}).select('email')
            // email = 15
            if (user) {
                // res.status(409).json({ message : "Email Exist"})
                return next(Error('Email Exist', { cause: 409 }))
            }else{
                
                const hash =bcrypt.hashSync(password , parseInt(process.env.SALTROUND)) ;
                const newUser = new userModel({userName , email , password : hash}) ;
                
                const token = jwt.sign({ id : newUser.id } , process.env.emailToken , {expiresIn : '1h'}) ;
             
                const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL }/auth/confirmEmail/${token}`
                const message = `
                    <a href = '${link}'>Confirm Email</a>
                `
                const info = await sendEmail(email , 'ConfirmEmail' , message) ;
                
                if (info?.accepted?.length) {
                    const savedUser = await newUser.save() ;
                   return res.status(201).json({ message : "Done" , savedUserID : savedUser._id } )
                }else{
                    // res.status(409).json({ message : "Email rejected" } )
                    return next(Error('Email rejected', { cause: 400 }))
                }
            }
            
        
    
    }
)
 


export const confirmEmail =asyncHandler(
    async (req , res , next) => {
        
            const {token} = req.params ;
            const decoded = jwt.verify(token , process.env.emailToken)
            
            if (!decoded?.id) {
                // res.status(409).json({ message :  "invalid payload"})
                next(new Error("invalid payload" , {cause : 400}))
            }else{
                const user = await userModel.findOneAndUpdate( {_id : decoded.id , confirmEmail : false } , { confirmEmail : true })
              return res.status(201).json({ message : "confirmed" , confirmEmail : user } )
            }
            
        }
        
     
) 


export const login = asyncHandler(
    async (req , res , next) => {
            const { email , password } = req.body ;
            const user = await userModel.findOne({email})

            if (!user) {
                return next(new Error("Email not Exist", { cause: 404 }))
            } else {
                if (!user.confirmEmail) {
                    return next(new Error("Email not confirmed yet", { cause: 400 }))
                } else {
                    const match = bcrypt.compareSync(password, user.password)
                    if (!match) {
                        return next(new Error("In-valid Password", { cause: 400 }))
                    } else {
                        const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.tokenSignature, { expiresIn: 60 * 60 * 24 })
                        return res.status(200).json({ message: "Done", token })
                    }
        
                }
            }
            
        } 
)
