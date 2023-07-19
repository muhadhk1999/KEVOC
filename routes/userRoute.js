const express = require("express");
const user_route = express();
const session = require("express-session");
const nocache = require("nocache");
const Auth = require("../middleware/userAuth")
const errorHandler = require('../middleware/ErrorHandler')

user_route.use(nocache());
user_route.use(
  session({
    secret:"sss",
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 6048000000,
    },
  })
);

//view engine
user_route.set("view engine", "ejs");
user_route.set("views", "./view/user");

//======================================CONTROLLERS=====================================================================//

const userAuth = require("../middleware/userAuth");
const userController = require("../controller/userController");
const productController = require("../controller/productController");
const adminController = require("../controller/adminController"); 
const addressController = require("../controller/addressConroller"); 
const cartController = require("../controller/cartController"); 

//=======================================HOME PAGE=======================================================================//
user_route.get("/",userController.loadHome)
user_route.get("/home",userController.loadHome)

//========================================LOGIN PAGE=====================================================================//
user_route.get('/login',Auth.isLogout,userController.loginLoad)
user_route.post('/login',userController.verifylogin)


//=========================================REGISTRATION PAGE=============================================================//
user_route.get('/registration',Auth.isLogout,userController.loadRegister)
user_route.post('/registration',userController.insertUser)
user_route.get('/Otp',userController.loadOtpVerification);
user_route.post('/Otp',userController.verifyEmail);

//PROFILE
user_route.get("/profile",Auth.isLogin,userController.loadProfile)
user_route.post("/editProfile",Auth.isLogin,userController.editProfile)
user_route.get("/editPassword",Auth.isLogin,userController.loadeditPassword)
user_route.post("/editPassword",Auth.isLogin,userController.resetPassword)

//==========================================SHOP PAGE====================//
user_route.get('/product/:id',userController.loadProduct)
user_route.get('/shop',userController.loadShop);
user_route.get('/checkOut',Auth.isLogin,userController.loadcheckOut);
user_route.post('/addAddress',Auth.isLogin,addressController.addAddress);
user_route.post('/editAddress/:id',Auth.isLogin,addressController.editaddAddress);
user_route.get('/deleteConfirm',Auth.isLogin,addressController.deleteAddress);
user_route.get("/filterCategory/:id",userController.filterByCategory)


//============================================CART PAGE=====================================================//
user_route.get('/cart',Auth.isLogin,cartController.loadCart);
user_route.post('/addtocart',Auth.isLogin,cartController.addToCart);
user_route.post('/changeQuantity',Auth.isLogin,cartController.changeProductCount);
user_route.post('/deletecart',Auth.isLogin,cartController.deletecart);

user_route.get('/payment',Auth.isLogin,userController.loadpayment);


user_route.get('/logout',Auth.isLogin,userController.logout)
module.exports= user_route;
