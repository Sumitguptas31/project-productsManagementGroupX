const UserModel = require("../Models/UserModel")
const mongoose= require('mongoose')
const orderModel = require("../Models/orderModel")


const isValid= function(value){
    if(typeof value==="undefined"||value===null)return false
    if(typeof value==="string"&&value.trim().length===0) return false
    if(typeof value===Number&&value.trim().length===0)return false
    return true
}
const isValidRequestBody= function(requestBody){
    return Object.keys(requestBody).length>0
}
const isValidObjectId=function(ObjectId)
{
   return mongoose.Types.ObjectId.isValid(ObjectId)
}


const createOrder= async function(req,res){

    try{
        let userId=req.params.userId
        let requestBody= req.body
        const{items,totalPrice,totalItems}= requestBody

        if(!userId){
            res.status(400).send({status:false,msg:"userId required"})
        }
        let user= await UserModel.findById(userId)
        if(!user){
            res.status(404).send({status:false,msg:"userId not exist"})
        }
        if(!isValid(items)){
            res.status(400).send({status:false,msg:"items required"})
        }
        if (!Array.isArray(items) || items.length == 0) {
            return res.status(400).send({ status: false, message: "items should present and it should be in array  ,not a empty array" })
        }
        requestBody["userId"]=userId
        if(!isValid(totalPrice)||totalPrice==0){
            res.status(400).send({status:false,msg:"totalPrice is required"})
        }
        if(!isValid(totalItems)||totalItems==0){
            res.status(400).send({status:false,msg:"totalItems is required"})
        }
        if (req.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }
        let totalQuantity=0
        for(i=0;i<items.length;i++){
            if(!isValidObjectId(items[i].productId))
            {
                return res.status(400).send({ status: false, message: `productId at  index ${i} is not valid objectId ` })
            }
            if(!isValid(items[i].quantity)){
                return res.status(400).send({ status: false, message: `quantity at index ${i} is not a valid number` })
            }
            totalQuantity=totalQuantity+items[i].quantity
            requestBody["totalQuantity"]=totalQuantity
        }
        let order= await orderModel.create(requestBody)
        res.status(201).send({status:true,msg:"order successfully created",data:order})
    }
    catch(error){
        res.status(500).send({status:false,msg:error.message})
    }
}

const updateOrder= async function(req,res){
    try{
        let userId= req.params.userId
        let requestBody= req.body
        const{orderId,status}= requestBody
        if(!userId){
            res.status(400).send({status:false,msg:"userId required"})
        }
        let user= await UserModel.findById(userId)
        if(!user){
            res.status(404).send({status:false,msg:"userId not exist"})
        }
        if (req.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }
        if(!isValidObjectId(orderId)){
            res.status(400).send({status:false,msg:"invalid orderId"})
        }
        if(!isValidObjectId(userId)){
            res.status(400).send({status:false,msg:"invalid userId"})
        }
        if(isValid(status)){
            if(!(["pending", "completed", "cancelled"].includes(status))){
                return res.status(400).send({status:false,message:"status is in valid"})
            }
        }else{
            return res.status(400).send({status:false,message:"provide status for update"})
        }


        let orderDetails= await orderModel.findById(orderId)
        if(!orderDetails){
            res.status(404).send({status:false,msg:"orderId not exist"})
        }
        if( orderDetails.userId!=userId){
            return res.status(400).send({ status: false, message: "order  not belongs to the user" })
        }

        let order= await orderModel.findOneAndUpdate({_id:orderId,cancellable:true},{status: status },{new:true})
        res.status(200).send({status:true,msg:"order status updated",data:order})

    }
 
    catch(error)
    {
        res.status(500).send({status:false,msg:error.message})
    }
}

    module.exports.createOrder=createOrder
    module.exports.updateOrder=updateOrder


