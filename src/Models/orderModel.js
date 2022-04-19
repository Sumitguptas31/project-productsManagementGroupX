const mongoose= require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema= new mongoose.Schema({

    
        userId: {type:ObjectId, ref:'Usercreated', required:true, unique:true},
        items: [{
            productId: {type:ObjectId, ref:'productDetail',required:true},
            quantity: {type:Number, required:true, min:1}
        }, {
          productId:{type:ObjectId, ref:'productDetail', required:true, unique:true},
          quantity: 1
        }],
        totalPrice:{type:Number,required:true},
        totalItems:{type:Number,required:true},
        totalQuantity: {type:Number,required:true},
        cancellable: {type:Boolean,default:true},
        status:  {type: String, default: 'pending',enum: ["pending", "completed", "cancelled"]}
},{timestamps:true})

module.exports= mongoose.model('orderDetail',orderSchema)