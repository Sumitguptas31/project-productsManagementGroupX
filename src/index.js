const express = require('express');
var bodyParser = require('body-parser');

const route = require('./routes/route.js');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://rahat6713:1819rahat@cluster0.iee0y.mongodb.net/sumit?retryWrites=true&w=majority", {useNewUrlParser: true ,  useUnifiedTopology: true })
    .then(() => console.log('mongodb is Conected'))
    .catch(err => console.log(err))

app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});


//
// const getBookById = async function(req,res){
//     try{
//         const userId = req.params.bookId
//        const getbook = await BookModel.findOne({ _id: userId })
//        const reviewdata = await ReviewModel.find()
//         res.status(200).send({ status: true, message: "sucessfully", result:getbook , reviews: reviewdata})
//     } catch (error) {
//         res.status(500).send({ status: false, message: error.message });
    
//     }
// }
