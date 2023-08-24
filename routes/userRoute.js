const express = require("express");
const user_route = express();
const session = require("express-session");
const nocache = require("nocache");
const Auth = require("../middleware/userAuth")
const errorHandler = require('../middleware/ErrorHandler')


//=========================================view engine====================================================================//
user_route.set("view engine", "ejs");
user_route.set("views", "./view/user");

//======================================CONTROLLERS=====================================================================//

const userController = require("../controller/userController");
// const productController = require("../controller/productController");
// const adminController = require("../controller/adminController"); 
const addressController = require("../controller/addressConroller"); 
const cartController = require("../controller/cartController"); 
const orderController = require("../controller/orderController"); 
const coupenController = require("../controller/coupenController"); 
const wishlistController = require("../controller/whishlistController"); 

//=======================================HOME PAGE=======================================================================//
user_route.get("/",userController.loadHome)
user_route.get("/home",userController.loadHome)

//========================================LOGIN PAGE=====================================================================//
user_route.get('/login',Auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifylogin)

//forgot password

user_route.get("/forgotPassword", userController.forgotPassword);
user_route.post('/forgotPassword',userController.forgotVerifyMail)
user_route.post('/verifyForgot',userController.verifyForgotMail)
user_route.post('/resubmitPassword',userController.resubmitPassword)


//=========================================REGISTRATION PAGE=============================================================//
user_route.get('/registration',Auth.isLogout,userController.loadRegister)
user_route.post('/registration',userController.insertUser)
user_route.get('/Otp',userController.loadOtpVerification);
user_route.post('/Otp',userController.verifyEmail);

//=============================================PROFILE====================================================================//
user_route.get("/profile",Auth.isLogin,userController.loadProfile)
user_route.post("/editProfile",Auth.isLogin,userController.editProfile)
user_route.get("/editPassword",Auth.isLogin,userController.loadeditPassword)
user_route.post("/editPassword",Auth.isLogin,userController.resetPassword)
user_route.get('/address',Auth.isLogin,addressController.showAddress)

//=============================================SHOP PAGE====================================================================//
user_route.get('/product/:id',userController.loadProduct)
user_route.get('/shop',userController.loadShop);
user_route.post('/addAddress',Auth.isLogin,addressController.addAddress);
user_route.post('/editAddress/:id',Auth.isLogin,addressController.editaddAddress);
user_route.get('/deleteConfirm',Auth.isLogin,addressController.deleteAddress);
user_route.get("/filterCategory/:id",userController.filterByCategory)
user_route.post("/form", userController.searchProduct)
user_route.get("/priceSort/:id", userController.priceSort)


//============================================CART PAGE=====================================================//
user_route.get('/cart',Auth.isLogin,cartController.loadCart);
user_route.post('/addtocart',Auth.isLogin,cartController.addToCart);
user_route.post('/changeQuantity',Auth.isLogin,cartController.changeProductCount);
user_route.post('/deletecart',Auth.isLogin,cartController.deletecart);

//=============================================ORDER MANAGMENT===============================================//

user_route.get('/checkOut',Auth.isLogin,orderController.loadcheckOut);
user_route.post('/placeOrder',orderController.placeOrder);
user_route.get('/orders',orderController.loadOrders);
user_route.get("/vieworder/:id",Auth.isLogin, orderController.loadDetailedView )
user_route.post('/cancelOrder',Auth.isLogin,orderController.CancelOrder);
user_route.post('/verifyPayment',orderController.verifyPayment)
user_route.post('/returnOrder',orderController.returnOrder);



user_route.post('/applyCoupon',coupenController.applyCoupon)


user_route.get("/logout",Auth.isLogin,userController.logout)


// =============== WISHLIST MANAGEMENT ================

user_route.get('/wishlist',Auth.isLogin,wishlistController.loadWishlist)
user_route.post('/addtoWishlist',Auth.isLogin,wishlistController.addToWishlist);
user_route.post('/addtocartfromwish',Auth.isLogin,wishlistController.addToCartFromWish);
user_route.post('/deletewishlist',Auth.isLogin,wishlistController.deleteWishlist);




user_route.use(errorHandler)

// user_route.get("*",function(req,res) {
//     res.redirect("/")
// })
module.exports= user_route;
