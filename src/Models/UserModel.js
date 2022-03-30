const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    title: {type:String,
         required:true,
          enum:["Mr", "Mrs", "Miss"]
        },
  name: {type:String, required:true},
  email: {
    type: String, trim: true, lowercase: true, unique: true, required: 'Email address is required',
    validate: {
        validator: function (email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
        }, message: 'Please fill a valid email address', isAsync: false
    }
},
phone: {
    trim: true,
    type: String,
    required: 'Intern mobile is required',
    unique: true,
    validate: {
        validator: function (phone) {
            return /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)
        }, message: 'Please fill a valid mobile number', isAsync: false
    }
},
  password: {type:String, required:true},
  address: {
    street: {type:String},
    city: {type:String},
    pincode: {type:String}
  },

},{timestamps:true})




module.exports = mongoose.model('Usersdata', UserSchema)

