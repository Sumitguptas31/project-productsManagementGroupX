const express = require('express');
const router = express.Router();
const UserController = require("../Controllers/UserController")
const BookController= require("../Controllers/BookController")
const reviewcontroller= require("../Controllers/ReviewController")
const Middleware= require("../Middlewares/Auth")



router.post("/register",UserController.CreateUser)
router.post("/login",UserController.loginUser)
router.post('/books',BookController.createBook)
router.get('/books',Middleware.authentication,BookController. getBooksQuery )
router.get('/books/:bookId',Middleware.authentication,BookController. getBookById)
router.put('/books/:bookId',Middleware.authentication,BookController.updatebook)
router.delete('/books/:bookId',Middleware.authentication,BookController.deletebook)
router.post("/books/:bookId/review",reviewcontroller.createReview)
router.put('/books/:bookId/review/:reviewId',reviewcontroller.updateReview)
router.delete("/books/:bookId/review/:reviewId",reviewcontroller.deleteRevByPath)




module.exports=router;