const express = require('express');
const router = express.Router();
const UserController = require("../Controllers/UserController")
const ProductController = require("../Controllers/productController")
const CartController= require("../Controllers/CartController")
const orderController= require("../Controllers/orderController")
const Middleware=require("../Middlewares/Auth");



router.post("/createUser",UserController.CreateUser)
router.post('/login',UserController.loginUser)
router.get('/user/:userId/profile',Middleware.authentication,UserController.getUser)
router.put('/user/:userId/profile',Middleware.authentication,UserController.updateUser)
router.post('/products',ProductController.createProduct)
router.get('/products',ProductController.getProduct)
router.get('/products/:productId',ProductController.getProductByid)
router.put('/products/:productId',ProductController.updateProduct)
router.delete('/products/:productId',ProductController.deleteProduct)
router.post('/users/:userId/cart',Middleware.authentication,CartController.cartCreate)
router.put('/users/:userId/cart',Middleware.authentication,CartController.updateCart)
router.get("/users/:userId/cart",Middleware.authentication,CartController.getCart)
router.delete("/users/:userId/cart",Middleware.authentication,CartController.deleteCart)
 router.post("/users/:userId/orders",Middleware.authentication,orderController.createOrder)
 router.put("/users/:userId/orders",Middleware.authentication,orderController.updateOrder)

module.exports=router;