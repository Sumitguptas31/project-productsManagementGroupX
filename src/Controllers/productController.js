const awsFile = require('aws-sdk')
const productModel = require("../Models/productModel")
const mongoose=require('mongoose')


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

awsFile.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        const s3 = new awsFile.S3({ appVersion: '2006-03-01' })

        const uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "shoppingCart /" + file.originalname,
            Body: file.buffer
        }

        s3.upload(uploadParams, function (err, data) {

            if (err) return reject({ error: err })
            console.log(" file uploaded succesfully ")
            return resolve(data.Location)
        })

    }
    )
}

const createProduct = async function (req, res) {


    try {

        const requestBody = req.body


        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted } = requestBody


        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "please enter title" })
        }

        const isTitleAlreadyExists = await productModel.findOne({ title: title })

        if (isTitleAlreadyExists) {
            return res.status(400).send({ status: false, message: "title already used" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "please enter description" })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "please enter price and it must be number" })
        }

        if (installments) {
            if (!isValid(installments)) {
                return res.status(400).send({ status: false, message: " installment   must be number" })
            }
        }

        if (isValid(isDeleted)) {
            if (isDeleted !== 'true' && isDeleted !== 'false') {
                return res.status(400).send({ status: false, message: "isdeleted  must be in boolean" })
            }
        }

        if (isValid(isFreeShipping)) {

            if (isFreeShipping !== 'true' && isFreeShipping != 'false') {
                return res.status(400).send({ status: false, message: "isFreeShipping  must be in boolean" })
            }
        }

        if (isValid(currencyId)) {
            if (currencyId != "INR") {
                return res.status(400).send({ status: false, message: "please provide valid currencyId i.e INR " })
            }
        } else {
            return res.status(400).send({ status: false, message: "please enter currencyId" })
        }

        if (isValid(currencyFormat)) {
            if (currencyFormat != "₹") {
                return res.status(400).send({ status: false, message: "please provide valid  currencyFormat i.e ₹ " })
            }
        } else {
            return res.status(400).send({ status: false, message: "please enter currencyFormat" })
        }

        if (style) {
            if (typeof style !== 'string') {
                return res.status(400).send({ status: false, message: "style must be in string" })
            }
        }


        if (!(availableSizes)) {
            return res.status(400).send({ status: false, message: "please enter availableSizes " })
        } 

          
        let availableSizesInArray = availableSizes.map(x => x.trim())
    console.log(availableSizesInArray)
        for (let i = 0; i < availableSizesInArray.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizesInArray[i]))) {
                return res.status(400).send({ status: false, message: "AvailableSizes contains ['S','XS','M','X','L','XXL','XL'] only" })
            } else {
                requestBody["availableSizes"] = availableSizesInArray
            }
     
            let files = req.files
            if (files && files.length > 0) {
                requestBody["productImage"] = await uploadFile(files[0])
            } else {
                return res.status(400).send({ status: false, message: "please provide profile pic " })

            }
            const productData = await productModel.create(requestBody)
            return res.status(201).send({ status: true, message: "product created successfully", data: productData })


        }

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//get the product

const  getProduct = async function(req,res){
        try {
    
            const requestQuery = req.query
    
            const { size, name, priceGreaterThan, priceLessThan, priceSort } = requestQuery
    
            const finalFilter = [{isDeleted:false}]
    
            if (isValid(name)) {
                finalFilter.push({ title: { $regex: name, $options: 'i' } })
            }
            
            if (isValid(size)) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(size))) {
                    return res.status(400).send({ status: false, message: "please enter valid size  " })
                }
                finalFilter.push({ availableSizes: size })
            }
    
            if (isValid(priceGreaterThan)) {
    
                finalFilter.push({ price: { $gt: priceGreaterThan } })
            }
            if (isValid(priceLessThan)) {
    
                finalFilter.push({ price: { $lt: priceLessThan } })
            }
    
    
            // if there is a price to sort 
            if (isValid(priceSort)) {
    
                if (priceSort != 1 || priceSort != -1) {
                    return res.status(400).send({ status: false, message: "pricesort must to 1 or -1" })
                }
                const fillteredProductsWithPriceSort = await productModel.find({ $and: finalFilter }).sort({ price: priceSort })
    
                if (Array.isArray(fillteredProductsWithPriceSort) && fillteredProductsWithPriceSort.length === 0) {
                    return res.status(404).send({ status: false, message: "data not found" })
                }
    
                return res.status(200).send({ status: false, message: "products with sorted price", data: fillteredProductsWithPriceSort })
            }
    
            //   
            const fillteredProducts = await productModel.find({ $and: finalFilter })
    
            if (Array.isArray(fillteredProducts) && fillteredProducts.length === 0) {
                return res.status(404).send({ status: false, message: "data not found" })
            }
    
            return res.status(200).send({ status: false, message: "products without sorted price", data: fillteredProducts })
    
    
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message })
        }
    
    }
    
    

    const getProductByid= async function(req,res){
    
        try{
            let data=req.params.productId
            if(!data){
                res.status(400).send({status:false,msg:"enter productId"})
            }
            let productData= await productModel.findOne({_id:data,isdeleted:false})
            if(!productData){
                res.status(404).send({status:false,msg:"productId not found"})
            }
            res.status(200).send({status:true,msg: "product details",data:productData})

        }
        catch(err){
            return res.status(500).send({status:false,message:err.message})
            }
    }

    const updateProduct = async function (req, res) {
        try {
    
            const requestBody = req.body
            console.log(requestBody)
            const productId = req.params.productId
            console.log(productId)
    
            const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody
    
           const finalFilter = {}
    
    
            if (!isValid(requestBody)) {
                return res.status(400).send({ status: false, message: "At least one input is required to update" })
            }
    
            if (!isValidObjectId(productId)) {
                console.log(validator.isValidObjectId(productId))
                return res.status(400).send({ status: false, message: "please provide valid productId" })
            }
           
            if (title) {
                if (!isValid(title)) {
                    return res.status(400).send({ status: false, message: "please enter title" })
                }
                const isTitleAlreadyExists = await productModel.findOne({ title: title })
    
                if (isTitleAlreadyExists) {
                    return res.status(400).send({ status: false, message: "title already used" })
                }
                finalFilter["title"] = title
            }
    
            if (description) {
                if (!validator.isValidString(description)) {
                    return res.status(400).send({ status: false, message: "please enter description" })
                }
                finalFilter["description"] = description
            }
    
            if (price) {
                if (!isValid(price)) {
                    return res.status(400).send({ status: false, message: "please enter price and it must be number" })
                }
                finalFilter["price"] = price
            }
    
            if (installments) {
                
                if (!isValid(installments)) {
                    return res.status(400).send({ status: false, message: " installment   must be number" })
                }
                finalFilter["installments"] = installments
            }
            if (isFreeShipping) {
                if (isFreeShipping !== 'true' && isFreeShipping != 'false') {
                    return res.status(400).send({ status: false, message: "isFreeShipping  must be in boolean to update " })
                }
                finalFilter["isFreeShipping"] = isFreeShipping
            }
            if (currencyFormat) {
                if (currencyFormat != "₹") {
                    return res.status(400).send({ status: false, message: "please provide valid  currencyFormat i.e ₹ " })
                }
                finalFilter["currencyFormat"] = currencyFormat
            }
    
            if (currencyId) {
                if (currencyId != "INR") {
                    return res.status(400).send({ status: false, message: "please provide valid currencyId i.e INR " })
                }
                finalFilter["currencyId"] = currencyId
            }
            if (style) {
                if (typeof style !== 'string') {
                    return res.status(400).send({ status: false, message: "style must be in string" })
                }
                finalFilter["style"] = style
            }
            if (availableSizes) {
                if (!isValid(availableSizes)) {
                    return res.status(400).send({ status: false, message: "please enter availableSizes " })
                }
                let availableSizesInArray = availableSizes.map(x => x.trim())
                for (let i = 0; i < availableSizesInArray.length; i++) {
                    if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizesInArray[i]))) {
                        return res.status(400).send({ status: false, message: "AvailableSizes contains ['S','XS','M','X','L','XXL','XL'] only" })
                    } else {
                        finalFilter["availableSizes"] = availableSizesInArray
                    }
                }
            }
            
            let files = req.files
            if (files && files.length > 0) {
                finalFilter["productImage"] = await uploadFile(files[0])
            }
          
        const updatedProductDetails = await productModel.findOneAndUpdate({_id: productId },{$set:finalFilter},{new:true})
         if(Object.keys(updatedProductDetails) <= 0){
             return res.status(404).send({status:false,message:"data not found"})
         }
    
         return res.status(200).send({status:false,message:"product updated successfully ",data:updatedProductDetails})
    
        } catch (err) {
            return res.status(500).send({ status: false, message:err.message})
        }
    
    }

   
    const deleteProduct= async function(req,res){
      try{
          let id=req.params.productId
          if(!id){
              res.status(400).send({status:false,massege:"enter productId"})
          }
          let data= await productModel.findOne({_id:id,isDeleted:false})
          if(!data){
              res.status(404).send({status:false,msg:"invalid productId"})
          }
          let product= await productModel.findOneAndUpdate({_id:id,isDeleted:false},{isDeleted:true,deletedAt:new Date()},{new:true})
          res.status(200).send({status:true,msg:"product deleted successfully",data:product})

      }
      catch(error){
        return res.status(500).send({status:false,message:error.message})
       }
    }
    module.exports.createProduct=createProduct
    module.exports. getProduct= getProduct
    module.exports.getProductByid = getProductByid
    module.exports.updateProduct = updateProduct
    module.exports.deleteProduct=deleteProduct