const express = require("express");
const user_route = express();
const session = require("express-session");
const nocache = require("nocache");


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

user_route.set("view engine", "ejs");
user_route.set("views", "./view/user");

const userAuth = require("../middleware/userAuth");
const userController = require("../controller/userController");
const productController = require("../controller/productController");


user_route.get("/",userController.loadHome)
user_route.get("/home",userController.loadHome)
user_route.get('/login',userController.loginLoad)
user_route.get('/registration',userController.loadRegister)
user_route.post('/registration',userController.insertUser)
user_route.post('/login',userController.verifylogin)
user_route.get('/product',userController.loadProduct)


user_route.get('/Otp',userController.loadOtpVerification);
user_route.post('/Otp',userController.verifyEmail);





module.exports=user_route;
