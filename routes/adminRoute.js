const express = require("express");
const admin_route = express();
const upload= require  ("../config/multer")


//=========================SET VIEW ENGINE===========================//

admin_route.set("view engine", "ejs");
admin_route.set("views", "./view/admin");

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

//=============================CONTROLLERS==========================//

const Auth = require("../middleware/adminAuth")
const errorHandler = require('../middleware/ErrorHandler')

const adminController = require("../controller/adminController");
const categoryConroller = require("../controller/categoryController");
const productController = require("../controller/productController");
const orderController = require("../controller/orderController");
const coupenController = require("../controller/coupenController");
const offerController = require("../controller/offerController");
const bannerController = require("../controller/bannerController");



//===========================ADMIN LOGIN PAGE=======================//

admin_route.get("/",adminController.loadLogin)
admin_route.post("/",adminController.verifyLogin)
// admin_route.get('/home',adminController.loadHome);

//============================USER LIST MANAGMENT====================//

admin_route.get('/userList',Auth.isLogin,adminController.loadUserList);
admin_route.get('/block-user',adminController.block);
admin_route.get('/unblock-user',adminController.unblock);

//=======================CATEGORY MANAGEMENT=========================//

admin_route.get('/category',categoryConroller.loadCategory);
admin_route.post('/category',categoryConroller.addCategory);
admin_route.get('/unlistcategory',categoryConroller.unlistCategory)
admin_route.get('/listcategory',categoryConroller.listCategory)
admin_route.post('/editCategory/:id',categoryConroller.editCategory);

//=====================PRODUCT MANAGEMENT==============================//

admin_route.get('/addProduct',productController.addProductLoad);
admin_route.post('/addProduct',upload.upload.array('image',10),productController.insertProduct);
admin_route.get('/deletecategory/:id',productController.deleteProduct)
admin_route.get('/editProduct/:id',productController.loadeditProduct)
admin_route.get('/unducategory/:id',productController.unduproduct)
admin_route.post("/search", productController.searchProduct)
admin_route.get("/priceSort/:id",productController.priceSort)
// admin_route.get("/filterCategory/:id",productController.filterByCategory)


// admin_route.get('/deleteimg/:imgid/:prodid',productController.deleteimage)
admin_route.post('/editProduct/:id',upload.upload.array('image',10),productController.editUpdateProduct)
// admin_route.post("/editProduct/updateimage/:id",upload.upload.array('image'),productController.updateimage)

admin_route.get('/deleteimg/:imgid/:prodid', productController.deleteimage);
admin_route.post('/editProduct/updateimage/:id', upload.upload.array('image'), productController.updateimage);


//===============================ORDER MANAGEMENT============================================================//

admin_route.get("/Aorders",orderController.loadOrderAdmin)
admin_route.get("/detailedOrder/:id", orderController.loadViewSingleAdmin)
admin_route.post("/updateStatus",orderController.changeStatus)


//=================================COUPEN MANAGEMENT============================================================//

admin_route.get("/coupen",coupenController.loadCoupen)
admin_route.get("/createCoupen",coupenController.loadAddCoupen)
admin_route.post("/addCoupon",coupenController.insertCoupon)
admin_route.post("/editCoupon/:id",coupenController.editCoupon)
admin_route.post("/deleteCoupon",coupenController.deleteCoupon)


//================================OFFER MANAGEMENT=========================================================================//


admin_route.get("/productOffer",offerController.loadProductOffer);
admin_route.post("/addOffer",offerController.addOffer)
admin_route.get('/unlistOffer',offerController.unlistoffer)
admin_route.get('/listOffer',offerController.listoffer)
admin_route.post('/editOffer/:id',offerController.editOffer);


//========================== BANNER MANAGEMENT =============================================================================//

admin_route.get("/banner",Auth.isLogin,bannerController.loadBannerManagement)
admin_route.post("/addbanner",upload.upload.single('image'),bannerController.addBanner)
admin_route.post('/editBanner', upload.upload.single('image'),bannerController.editBanner);
admin_route.post("/deleteBanner",bannerController.deleteBanner) 







admin_route.get("/dashbord",adminController.loadDashbord)
admin_route.get("/salesReport",adminController.loadSalesReport)
admin_route.get('/salesSort/:id',adminController.salesSort);

admin_route.use(errorHandler)


module.exports = admin_route
