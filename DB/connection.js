import mongoose from 'mongoose'
const connectDB  = async ()=>{
    return await mongoose.connect('mongodb+srv://samarEssam:gQVCo8HX6ouygB0o@cluster0.6hiiuac.mongodb.net/Eccomerce')
    .then(res=>console.log(`DB Connected successfully on .........${process.env.DBURI} `))
    .catch(err=>console.log(` Fail to connect  DB.........${err} `))
}


export default connectDB;