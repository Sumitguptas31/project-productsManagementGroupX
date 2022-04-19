const UserModel = require("../Models/UserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const saltRounds = 10;
const aws = require('aws-sdk')
const Middleware=require("../Middlewares/Auth")


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

const uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        const s3 = new aws.S3({ appVersion: '2006-03-01' })

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


//create the user

const CreateUser = async function (req, res) {
    try {
        const requestBody = req.body
        let {fname,lname,email,profileImage,phone,password,address } = requestBody

        if (!isValid(fname)) {
            return res.status(400).send({status: false, msg: "Enter fname " })
        }
        if (!isValid(lname)) {
            return res.status(400).send({status: false,  msg: "Enter lname " })
        }
        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "Enter email " })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
            res.status(400).send({ status: false, message: `Email should be a valid email address` })
            return
        }
        const isemail = await UserModel.findOne({ email })
        if (isemail) {
            return res.status(400).send({status: false, msg: "Email.  is already used" })
        }

        if (!isValid(phone)) {
            return res.status(400).send({status: false, msg: "Enter phone no. " })
        }
        const isphone = await UserModel.findOne({ phone })
        if (isphone) {
            return res.status(400).send({status: false, msg: "Phone no.  is already used" })
        }
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/.test(phone))) {
            return res.status(400).send({ status: false, message: `Phone number should be a valid number` })

        }
        if (!isValid(password.trim())) {
            return res.status(400).send({status: false, msg: "Enter Password " })
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password.trim()))) {
            return res.status(400).send({status: false, msg: "password length Min.8 - Max. 15" })
        }
        // if (!isValid(profileImage)) {
        //     return res.status(400).send({status: false, msg: "Enter phone no. " })
        // }
        // if (!isValid(address)) {
        //     return res.status(400).send({status: false, msg: "Enter phone no. " })
        // }
        if (!isValid(address.shipping.street)) {
            return res.status(400).send({status: false, msg: "Enter street" })
        }
        if (!isValid(address.shipping.city)) {
            return res.status(400).send({status: false, msg: "Enter city " })
        }
        if (!isValid(address.shipping.pincode)) {
            return res.status(400).send({status: false, msg: "Enter pincode" })
        }
        if (!isValid(address.billing.street)) {
            return res.status(400).send({status: false, msg: "Enter street " })
        }
        if (!isValid(address.billing.city)) {
            return res.status(400).send({status: false, msg: "Enter city " })
        }
        if (!isValid(address.billing.pincode)) {
            return res.status(400).send({status: false, msg: "Enter pincode" })
        }

        let files = req.files
        if (files && files.length > 0) {
            profileImage = await uploadFile(files[0])
            console.log(profileImage)
        } else {
            return res.status(400).send({ status: false, message: "please provide profile pic " })

        }
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashPassword = await bcrypt.hash(password, salt);
        console.log(hashPassword)

        let user= {
            fname: fname,
            lname: lname,
            email: email,
            profileImage: profileImage,
            phone: phone,
            password: hashPassword,
            address: address
        }


        const NewUsers = await UserModel.create(user)
        return res.status(201).send({ Status: true, msg: "userData sucessfully Created", data: NewUsers })

    }
    catch (error) {
        return res.status(500).send(error.message)
    }
}

const loginUser= async function(req,res){
try{
const data=req.body
const{email,password}=data
if (!isValidRequestBody(data)) {
    res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
    return
}
if (!isValid(email)) {
    res.status(400).send({ status: false, message: `Email is required` })
    return
}

if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
    res.status(400).send({ status: false, message: `Email should be a valid email address` })
    return
}
if (!isValid(password.trim())) {
    res.status(400).send({ status: false, message: `Password is required` })
    return
}
const isUserExists = await UserModel.findOne({ email: email })

        if (isUserExists) {
            const isPasswordCorrect = await bcrypt.compare(password, isUserExists.password);
            if (!isPasswordCorrect) {
                return res.status(400).send({ status: false, message: "password or email is wrong" })
            }
        } else {
            return res.status(400).send({ status: false, message: "email or password is wrong" })
        }
let id=isUserExists._id
const token = await jwt.sign({
    userId:id,
    iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 7
}, 'someverysecuredprivatekey')

res.header('Authorization', token);

const loginData={UserId:id,token:token}

return res.status(200).send({ status: true, message: `user login successfull`, data:loginData});
}
 catch (error) {
res.status(500).send({ status: false, message: error.message });
}
}

const getUser= async function(req,res){
    try{
        let userId= req.params.userId
        if(!userId){
            res.status(400).send({status:false,msg:"enter userId"})
        }
       let user= await UserModel.findOne({_id:userId})
       if(!user)
       {
           res.status(404).send({status:false,msg:"userid not found"})
       }
       res.status(200).send({status:true,msg: "User profile details",data:user})


    }
    catch(error){
        res.status(500).send({ status: false, message: error.message });

    }
}

const updateUser = async function (req, res) {
    try {

        const requestBody = req.body

        const userId = req.params.userId

        const { fname, lname, email, phone, password, address } = requestBody

        let finalFilter = {}

        if (isValid(fname)) {
            finalFilter["fname"] = fname
        }
        if (isValid(lname)) {
            finalFilter["lname"] = lname
        }

        if (isValid(email)) {
            if (!/^([a-z0-9\.-]+)@([a-z0-9-]+).([a-z]+)$/.test(email.trim())) {
                return res.status(400).send({ status: false, message: "EMAIL is not valid" })
            }
            const isEmailAlreadyUsed = await UserModel.findOne({ email })
            if (isEmailAlreadyUsed) {
                return res.status(400).send({ status: false, message: "email already used " })
            }
            finalFilter["email"] = email

        }

        if (isValid(phone)) {
            if (!(!isNaN(phone)) && /^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[789]\d{9}|(\d[ -]?){10}\d$/.test(phone.trim())) {
                return res.status(400).send({ status: false, message: " PHONE NUMBER is not a valid mobile number" });
            }
            const isphoneNumberAlreadyUsed = await UserModel.findOne({ phone })
            if (isphoneNumberAlreadyUsed) {
                return res.status(400).send({ status: false, message: "phone Number already used " })
            }
            finalFilter["phone"] = phone
        }
        if (isValid(password)) {
            finalFilter["password"] = password
        }
        if (isValid(address)) {
            if (address.shipping.pincode) {
                if (typeof address.shipping.pincode !== 'number') {
                    return res.status(400).send({ status: false, mesaage: "shipping pincode must be number" })
                }
            }
            if (address.billing.pincode) {
                if (typeof address.billing.pincode !== 'number') {
                    return res.status(400).send({ status: false, mesaage: "billing pincode must be number" })
                }
            }
            finalFilter["address"] = address
        }

        let files = req.files
        if (files) {
            if (files && files.length > 0) {

                const profileImage = await uploadFile(files[0])

                if (profileImage) {
                    finalFilter["profileImage"] = profileImage
                }
            }
        }

                
            
        
        const postData = await UserModel.findOneAndUpdate({ _id: userId }, { $set: finalFilter }, { new: true })

        return res.status(200).send({ status: true, message: "User profile updated", data: postData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}



module.exports.CreateUser = CreateUser
module.exports.loginUser=loginUser
module.exports.getUser=getUser
module.exports.updateUser=updateUser
