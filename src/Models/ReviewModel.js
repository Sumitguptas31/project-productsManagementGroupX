const mongoose = require("mongoose")

const ObjectId=mongoose.Schema.Types.ObjectId
const ReviewSchema = new mongoose.Schema({
    bookId:{
        type:ObjectId,
        required:true,
        ref:"books"
    },
    reviewedBy: {
        type:String,
        required:true,
          default :'Guest',
        value: "reviewer's name"
    },
    reviewedAt: {
        type:Date, 
        required:true
    },
    rating: {
        type:Number,
         minNumber: 1, 
         maxNumber:5,
          required:true
        },
        reviews: {
            type:String, 
            required:false
        },
        isDeleted: {
            type:Boolean, 
            default: false
        },
},{timestamps:true})
module.exports=mongoose.model("reviews",ReviewSchema)