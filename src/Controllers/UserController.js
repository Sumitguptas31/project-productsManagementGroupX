const UserModel = require("../Models/UserModel")
const jwt = require("jsonwebtoken")


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}



const CreateUser = async function (req, res) {
    try {
        const user = req.body
        const { title, name, email, phone, password } = user

        if (!isValidRequestBody(user)) {
            return res.status(400).send({ status: false, msg: "enter data in user body" })
        }
        if (!isValid(title)) {
            return res.status(400).send({status: false, msg: "Enter Title " })
        }
        // if(title != "Mr" ||"Miss"||"Mrs"){
        //   return res.status(400).send({msg: "Title should be Mr or Miss or Mrs"})
        // }
        if (!isValid(name)) {
            return res.status(400).send({status: false,  msg: "Enter Valid Name " })
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
        if (!(/^[6-9]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: `Phone number should be a valid number` })

        }
        if (!isValid(password.trim())) {
            return res.status(400).send({status: false, msg: "Enter Password " })
        }
        if (!(/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password.trim()))) {
            return res.status(400).send({status: false, msg: "password length Min.8 - Max. 15" })
        }

        const NewUsers = await UserModel.create(user)
        return res.status(201).send({ Status: true, msg: "InternData sucessfully Created", data: NewUsers })

    }
    catch (error) {
        return res.status(500).send(error.message)
    }
}

const loginUser = async function (req, res) {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
            return
        }

        const { email, password } = requestBody;

        
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
       
        
        const author = await UserModel.findOne({ email, password });

        if (!author) {
            res.status(401).send({ status: false, message: `Invalid login credentials` });
            return
        }
        // GENERATE JWT TOKEN
        const token = await jwt.sign({
            UserId: author._id,
        }, 'someverysecuredprivatekey',{ expiresIn: 60 * 1 })

        res.header('x-api-key', token);
        return res.status(200).send({ status: true, message: `Author login successfull`, data: { token } });
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}




module.exports.CreateUser = CreateUser
module.exports.loginUser=loginUser