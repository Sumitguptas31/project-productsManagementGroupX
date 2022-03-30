const BookModel = require("../Models/BookModel");
const UserModel = require("../Models/UserModel");
const ReviewModel = require("../Models/ReviewModel")


const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createReview = async function (req, res) {
    try {
        let data = req.body
        let bookid = req.params.bookId
        const { bookId, reviewedBy, reviewedAt, rating } = data

        if (!isValidRequestBody(data)) {
            return res.status(400).send("Please enter valid details in body")
        }

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "Enter bookId " })
        }

        if (bookId !== bookid) {
            return res.status(400).send({ status: false, msg: "Enter valid bookId in body" })
        }



        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: "Enter reviewedBy " })
        }

        if (!isValid(reviewedAt)) {
            return res.status(400).send({ status: false, msg: "Enter reviewedAt field " })
        }

        if (!isValid(rating)) {
            return res.status(400).send({ status: false, msg: "Enter rating " })

        }

        if (rating > 5) {
            return res.status(400).send({ status: false, msg: "Rating should not be more than 5" })
        }

        if (rating <= 0) {
            return res.status(400).send({ status: false, msg: "Rating should not be less than 1" })
        }

        let book = await BookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            res.status(404).send({ msg: "No Book found" })
        }

        const newReview = await ReviewModel.create(data)
        let updateInBook = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } })
        return res.status(201).send({ status: true, Data: newReview })


    } catch (error) {
        return res.status(500).send(error.message)
    }

}


const updateReview = async function (req, res) {
    try {
        //let data = req.body
        let review = req.body.review
        let rating = req.body.rating
        let reviewedBy = req.body.reviewedBy
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId



        let book = await BookModel.findOne({ _id: bookId, isDeleted: false })

        if (book) {

            let review = await ReviewModel.findById({ _id: reviewId, isDeleted: false })
            if (review) {
                let updateReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, {$set:{ review: review, rating: rating, reviewedBy: reviewedBy }} ,{ new: true })

                return res.status(200).send({ data: updateReview })
            } else {
                return res.status(404).send({ status: false, msg: "No review Found" })
            }

        } else {
            return res.status(404).send({ status: false, msg: "no book found" })

        }




    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }

} 


const deleteRevByPath = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let book = await BookModel.findOne({ _id: bookId, isDeleted: false })
        if (book) {

            let isReview = await ReviewModel.findOne({ _id: reviewId, isDeleted: false })
            if (isReview) {
                let delReview = await ReviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { isDeleted: true })
                let updateInBook = await BookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } })
                res.status(200).send({status:true,msg:'deleted successfully'})
            } else {
                res.status(404).send({ msg: "No Review data found" })

            }
        } else {
            res.status(404).send({ msg: "No Book found" })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}



module.exports.createReview=createReview
module.exports.updateReview=updateReview
module.exports.deleteRevByPath=deleteRevByPath