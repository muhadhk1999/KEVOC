const express = require("express");
const admin_route = express();
const session = require("express-session");
const nocache = require("nocache");
const multer =require ("multer")
const upload= require  ("../config/multer")


admin_route.use(nocache());
admin_route.use(
  session({
    secret:"sss",
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 6048000000,
    },
  })
);

admin_route.set("view engine", "ejs");
admin_route.set("views", "./view/admin");

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

const adminController = require("../controller/adminController");
const categoryConroller = require("../controller/categoryController");
const productController = require("../controller/productController");


admin_route.get("/",adminController.loadLogin)
admin_route.post("/",adminController.verifyLogin)
admin_route.get('/home',adminController.loadHome);
admin_route.get('/userList',adminController.loadUserList);
admin_route.get('/block-user',adminController.block);
admin_route.get('/unblock-user',adminController.unblock);

admin_route.get('/category',categoryConroller.loadCategory);
admin_route.post('/category',categoryConroller.addCategory);
admin_route.get('/unlistcategory',categoryConroller.unlistCategory)
admin_route.get('/listcategory',categoryConroller.listCategory)
admin_route.post('/editCategory/:id', categoryConroller.editCategory);



admin_route.get('/addProduct',  productController.addProductLoad);
admin_route.post('/addProduct',upload.upload.array('image',10),productController.insertProduct);





module.exports = admin_route
