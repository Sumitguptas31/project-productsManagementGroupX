const productModel = require("../Models/productModel")
const mongoose=require('mongoose')
const UserModel = require("../Models/UserModel")
const CartModel=require("../Models/CartModel")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'Number' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const cartCreate = async function (req, res) {
    try {

        const userId = req.params.userId
        const requestBody = req.body

        const { cartId, productId, quantity } = requestBody                    


        // validating the userId ,productId ,quantity
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is invalid" })
        }
        if (!isValid(quantity)) {
            return res.status(400).send({ status: false, message: "quantity must be number and present" })
        }
        if (quantity < 0) {
            return res.status(400).send({ status: false, message: "quantity must greater than zero" })
        }

        // authorization
        if (req.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }

        // checking the userId and productId exists or not  in database
        const isUserExists = await UserModel.findById(userId)
        if (!isUserExists) {
            return res.status(404).send({ status: false, message: "user data not found" })
        }
        const isProductExists = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!isProductExists) {
            return res.status(404).send({ status: false, message: "product data not found" })
        }

        // --------------------------------------If cartId exist in requestBody----------------------------------------

        if (cartId) {

            // validating the cartId
            if (!isValid(cartId)) {
                return res.status(400).send({ status: false, message: "cartId is invalid" })
            }
            // checking the cartId exists or not in database
            const isCartExists = await CartModel.findById(cartId)
            if (!isCartExists) {
                return res.status(404).send({ status: false, message: "cart data not found" })
            }

            // calculating  the total price   
            //totalPrice = product price(from product database) multiple by total number of quantity(from input)  and add totalPrice(from cart database)
            const totalPrice = isProductExists.price * quantity + isCartExists.totalPrice

            // totalItems = quantity(from input) and add totalItems (from cart database)
            const totalItems = 1 + isCartExists.totalItems
            let arrayOfItems = isCartExists.items

            for (let i = 0; i < arrayOfItems.length; i++) {
                if (arrayOfItems[i].productId == productId) {

                    let finalFilter = {
                        totalPrice: totalPrice
                        // totalItems:totalItems
                    }

                    finalFilter[`items.${i}.quantity`] = quantity + arrayOfItems[i].quantity

                    const productToDeleteFromCart = await CartModel.findOneAndUpdate({ items: { $elemMatch: { productId: arrayOfItems[i].productId } } }, { $set: finalFilter }, { new: true })
                    return res.send({ productToDeleteFromCart })
                }
            }


            //  storing in a variable what we need to update 
            const cartDataToAddProduct = {
                $push: { items: [{ productId: productId, quantity: quantity }] },      //by using $push we will push the productid and quantity in items Array
                totalPrice: totalPrice,
                totalItems: totalItems,
            }

            // updating the new items and totalPrice and tOtalItems
            const addToCart = await CartModel.findOneAndUpdate({ _id: cartId }, cartDataToAddProduct, { new: true })
            if(!addToCart){
                return res.status(409).send({status:false,message:"failed to update"})
            }
            return res.status(200).send({ status: true, message: "product add to cart successfully", data: addToCart })

        }
        // ----------------------------------------------------------------------------------------------------------

        // --------------------------If cartId not exist in requestBody it will create the new cart----------------------------------------
   
        //  storing in a variable what we need to create
        const cartDataToCreate = {
            userId: userId,
            items: [{
                productId: productId,
                quantity: quantity,
            }],
            totalPrice: isProductExists.price * quantity,
            totalItems: 1,
        }
        
        // creating the new cart with adding the products
        const cartCreation = await CartModel.create(cartDataToCreate)
        if(!cartCreation){
            return res.status(409).send({status:false,message:"failed to create"})

        }
        return res.status(200).send({ status: true, message: "cart created", data: cartCreation })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateCart = async function (req, res) {

    try{
    userId = req.params.userId
    data = req.body

    let { cartId, productId, removeProduct } = data

    if (!isValid(productId)) { return res.status(400).send({ status: false, message: 'Product Id is required' }) }

    if (!isValid(cartId)) { return res.status(400).send({ status: false, message: 'cart Id is required' }) }

    if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: 'Invalid product id' }) }

    if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: 'Invalid cart id' }) }

    if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: 'Invalid user id' }) }


    const findingProduct = await productModel.findById(productId)
        const findCart = await CartModel.findById(cartId)
    if (removeProduct == 0) {

        items = findCart.items
        console.log(items)

        for (let i = 0; i < items.length; i++) {
            if (productId == items[i].productId.toString()) {
                console.log(productId)
                console.log(items[i].productId.toString())
                let update = {

                    $pull: { items: { productId: productId } },
                    totalItems: findCart.totalItems - items[i].quantity,
                    totalPrice: findCart.totalPrice - findingProduct.price * items[i].quantity
                }

                const findingCart = await CartModel.findOneAndUpdate({ _id: cartId }, update, { new: true })
                res.status(200).send({ status: true, msg: "product remove sucessfully", data: findingCart })


            }
        }

    }
    if (removeProduct == 1) {


        items = findCart.items
        console.log(items)
        for (let i = 0; i < items.length; i++) {
            if (productId == items[i].productId.toString()) {
                let update = {
                    totalItems: findCart.totalItems - 1,
                    totalPrice: findCart.totalPrice - findingProduct.price
                }

                update[`items.${i}.quantity`] = findCart.items[i].quantity-1


                const findingCart = await CartModel.findOneAndUpdate({ _id: cartId }, update, { new: true })
                res.status(200).send({ status: true, msg: "product quantity decresed sucussfully", data: findingCart })

            }
        }

    }

}
catch(error){
    res.status(500).send({status:false,msg:error.message})
}
}
const getCart= async function(req,res){

    try{
        let userId=req.params.userId
        if(!userId){
            res.status(400).send({status:false,msg:"invalid userId"})
        }
        let user= await UserModel.findOne({_id:userId})
        if(!user){
            res.status(404).send({status:false,msg:"userId not found"})
        }
        if (req.userId != userId) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }
        let cart= await CartModel.findOne({userId:userId})
        console.log(cart)
            if(!cart){
            res.status(404).send({status:false,msg:"cart not found"})
            }
            res.status(200).send({status:true,msg:"cart details",data:cart})
            
    }
    catch(error)
    {
        res.status(500).send({status:false,msg:error.message})
    }



}
const deleteCart = async function(req,res){
    try{
        const id= req.params.userId
        if(!id){
            res.status(400).send({status:false,msg:"invalid userId"})
        }
        let user= await UserModel.find({_id:id})
        if(!user){
            res.status(404).send({status:false,msg:"userId not found"})
        }
        if (req.userId != id) {
            return res.status(403).send({ status: false, message: "you are not authorized" })
        }
         let cartdetails= await CartModel.findOne({userId:id})
      if(!cartdetails){
          res.status(404).send({status:false,msg:"cart not found"})
      }
     
        const cart = {
            items: [],
            totalPrice: 0,
            totalItems: 0
        }
        const cartDeletion = await CartModel.findOneAndUpdate({_id:cartdetails._id},cart,{new:true})
        res.status(200).send({status:true,msg:"cart deleted successfully",data: cartDeletion})
    }
    catch(error){
        res.status(500).send({status:false,msg:error.message})
    }
}

module.exports.cartCreate= cartCreate
module.exports.getCart=getCart
module.exports.deleteCart=deleteCart
module.exports.updateCart=updateCart