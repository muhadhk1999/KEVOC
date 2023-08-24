const session = require("express-session")
const User=require("../model/userModel")
const Product=require("../model/productModel")
const Category=require("../model/categoryModel")
const Address=require("../model/addressModel")
const Cart = require("../model/cartModel")
const Order = require('../model/orderModel')
const Coupon = require('../model/coupenModel')
const razorpay = require("razorpay")
const crypto = require("crypto")

//=================================================CHECKOUT PAGE RENDERING====================================================//

const loadcheckOut = async (req, res, next) => {
  try {
    const session = req.session.user_id
    const couponData = await Coupon.find({})
    const userData = await User.findOne ({_id:req.session.user_id});
    const addressData = await Address.findOne({userId:req.session.user_id});
    const currentDate = new Date();

    const validCoupons = couponData.filter(item => item.expiryDate > currentDate);
    const total = await Cart.aggregate([
      { $match: { userId: req.session.user_id } },
      { $unwind: "$products" },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$products.productPrice", "$products.count"] } },
        },
      },
    ]);


    
    if(req.session.user_id){
      if(addressData){
          if(addressData.addresses){
            const address = addressData.addresses
            const Total = total.length > 0 ? total[0].total : 0; 
            const totalAmount = Total;
            res.render('checkOut',{session,addresses:address,totalAmount,userData:userData,coupons:validCoupons})
          }
          else{
              const Total = total.length > 0 ? total[0].total : 0; 
              const totalAmount = Total;
            res.render('checkOut',{session,addresses:[],totalAmount,userData:userData,coupons:validCoupons});
          }
        }else{
          const Total = total.length > 0 ? total[0].total : 0; 
          const totalAmount = Total;
          res.render('checkOut',{session,addresses:[],totalAmount,userData:userData,coupons:validCoupons});
        }
      }else{
        res.redirect('/')
      }
  } catch (error) {
    next(error);
  }
}

var instance = new razorpay({
  key_id: process.env.Razorpay_Key_Id,
  key_secret: process.env.Razorpay_Key_Secret,
});


// ======================================= PLACE ORDER ====================================================================//

const placeOrder = async (req,res,next) => {
  try{
    const id = req.session.user_id
    const userName = await User.findOne({_id:id})
    const address = req.body.address
    const paymentMethod = req.body.payment
    const cartData =  await Cart.findOne({userId:id})
    const products = cartData.products

    const Total = parseInt(req.body.amount)
   
    console.log(req.body.amount);

    const status = paymentMethod === "COD" ? "placed" : "pending";
    const order = new Order({
      deliveryAddress:address,
      userId: id,
      userName:userName.name,
      paymentMethod: paymentMethod,
      products: products,
      totalAmount:Total,
      // Amount:totalPrice,
      date:new Date(),
      status:status,

    })
    console.log(order);
   
    const orderData = await order.save()
    if (orderData) {
     
      if(order.status === 'placed'){
        for(let i= 0;i<products.length;i++){
          const pro =products[i].productId;
          const count = products[i].count;
          await Product.findByIdAndUpdate({_id:pro},{$inc:{StockQuantity: -count}});
  
        }
        await Cart.deleteOne({userId:id})  
        res.json({codSuccess : true})
      }else{
        if(paymentMethod == 'Wallet'){
          const walletAmount = userName.wallet
          if(walletAmount >= Total){
            for(let i= 0;i<products.length;i++){
              const pro =products[i].productId;
              const count = products[i].count;
              await Product.findByIdAndUpdate({_id:pro},{$inc:{StockQuantity: -count}});     
            }
            await User.findByIdAndUpdate({_id:id},{$inc:{wallet : -Total}})
            await Cart.deleteOne({userId:id}) 
            const orderId = order._id 
            await Order.findByIdAndUpdate({_id:orderId},{$set:{status: 'placed'}})
            res.json({codSuccess : true})
            
          }else{
            res.json({walletFailed:true})
          
          }
        }else{
        const orderId = orderData._id;
        const totalAmount = orderData.totalAmount;
        var options = {
          amount : totalAmount*100,
          currency : 'INR',
          receipt : ''+ orderId
        }
        instance.orders.create(options,function(err,order){
          res.json({order})
        })
      }
    }
    } else {
      res.redirect("/checkout")
    }
  } catch (error) {
    next(error);
  }
}

//=============================================ORDER-SUCCESS AND ORDER LIST PAGE  USER SIDE=========================================//

const loadOrders = async (req, res, next) => {
  try {
    const session = req.session.user_id;
    const id = req.session.user_id;
    const product = await Product.find();
    const userdata = await User.findById(id);
    // await Order.deleteMany({ status: 'pending' });

    // Sort the orders by date field in descending order (latest first)
    const orders = await Order.find({ userId: id }).populate("products.productId").sort({ date: -1 });

    if (orders.length > 0) {
      res.render("orders", { userData: userdata, session, orders: orders });
    } else {
      res.render("orders", { userData: userdata, session, orders: [] });
    }
  } catch (error) {
    next(error);
  }
};



//======================================DETAILED VIEW OF OREDR IN USER SIDE=============================================//

const loadDetailedView = async (req,res,next)=> {
  try {
    const id = req.params.id;
    const session =req.session.user_id
    const userdata = await User.findOne({_id: session})
    const orders = await Order.findOne({_id:id}).populate("products.productId")
    res.render("detailedOrder",{session,userData:userdata,orders:orders})
  } catch (error) {
    next(error);
  }
}


//=============================================CANCEL ORDER IN ORDERS=====================================================//

const CancelOrder = async (req, res,next) => {
  try {
    const id = req.body.orderid;
    const reason = req.body.reason
    const ordersId = req.body.ordersid;
    const Id = req.session.user_id
    const userData = await Order.findById(Id)
    const orderData = await Order.findOne({ userId: Id, 'products._id': id})
    const product = orderData.products.find((Product) => Product._id.toString() === id);
    const cancelledAmount = product.totalPrice
    const proCount = product.count
    const proId = product.productId   
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: Id,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': 'cancelled',
          'products.$.cancelReason': reason
        }
      },
      { new: true }
    );


    if (updatedOrder) {
         await Product.findByIdAndUpdate({_id:proId},{$inc:{StockQuantity:proCount}})
      if(orderData.paymentMethod === 'onlinePayment' || orderData.paymentMethod === 'Wallet'){
         await User.findByIdAndUpdate({_id:Id},{$inc:{wallet:cancelledAmount}})
        //  await ordermodel.findByIdAndUpdate({_id:Id},{$inc:{totalAmount:-cancelledAmount}})

        await Order.findByIdAndUpdate(Id, { $inc: { totalAmount: -cancelledAmount } });

         res.redirect("/orders")
      }else{
        res.redirect("/orders" )
      }
    } else {
      res.redirect("/orders")
    }
  } catch (error) {
    next(error);
  }
};


//========================================ORDER VIEW IN ADMIN SIDE=======================================================//


const loadOrderAdmin = async(req,res,next) => {
  try {
      const session = req.session.Auser_id
      const id = req.session.user_id
      const adminData = await User.findOne({is_admin : 1})
      await Order.deleteMany({status:'pending'})
      const orders = await Order.find().populate("products.productId")

      if(orders.length > 0){

        res.render("Aorders", {orders:orders,admin:adminData});

    }else{
      res.render("Aorders", { orders:[],admin:adminData });

    }
  } catch (error) {
    next(error);
  }
}

//========================================LOAD DETAILED ORDER VIEW IN ADMIN SIDE=========================================//

const loadViewSingleAdmin = async (req,res,next)=> {
  try {
    const id = req.params.id
    const adminData = await User.findOne({is_admin : 1})
    const orderData = await Order.findOne({_id:id}).populate("products.productId")
    res.render("detailedOrder",{admin:adminData,orders:orderData})
  } catch (error) {
    next(error);
  }
}

//=====================================CHANGE STATUS IN ADMIN PAGE======================================================//

const changeStatus = async(req,res,next) =>{
  try {
    const id = req.body.id
    console.log(id);
    const userId = req.body.userId
    const statusChange = req.body.status
    
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: userId,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': statusChange
        }
      },
      { new: true }
    );
    if(statusChange == "Delivered"){
      const updatedOrder = await Order.findOneAndUpdate(
        {
          userId: userId,
          'products._id': id
        },
        {
          $set: {
            'products.$.deliveryDate': new Date()
          }
        },
        { new: true }
      );
    }
    if(updatedOrder){
      res.json({success:true})
    }
  } catch (error) {
    next(error);
  }
}

//============================================= RAZORPAY VERIFY PAYMENT ====================================================//

const verifyPayment = async(req,res)=>{
  try {
    const details = req.body
    const id = req.session.user_id
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256',process.env.Razorpay_Key_Secret);
    hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
    const hmacValue = hmac.digest('hex');
    const cartData =  await Cart.findOne({userId:id})
    const products = cartData.products
    if(hmacValue === details.payment.razorpay_signature){
      for(let i= 0;i<products.length;i++){
        const pro =products[i].productId;
        const count = products[i].count;
        await Product.findByIdAndUpdate({_id:pro},{$inc:{StockQuantity: -count}});

      }

     const c = await Order.findOneAndUpdate({_id:details.order.receipt},{$set:{status:"placed"}});
     console.log(c);
      await Order.findOneAndUpdate({_id:details.order.receipt},{$set:{paymentId:details.payment.razorpay_payment_id}})
      await Cart.deleteOne({userId:req.session.user_id})
      res.json({success:true});
    }else{
      // await ordermodel.findByIdAndRemove({_id:details.order.receipt});
      res.json({success:false})
    }
  } catch (error) {
    console.log(error.message);
  }
}


//============================================ RETURN ORDER =============================================================//

const returnOrder = async(req,res,next) =>{
  try {
    const ordersId = req.body.ordersid;
    const Id = req.session.user_id
    const id = req.body.orderid;
    const reason = req.body.reason
    const userData = await Order.findById(Id)
    const orderData = await Order.findOne({ userId: Id, 'products._id': id})
    const product = orderData.products.find((Product) => Product._id.toString() === id);
    const returnAmount = product.totalPrice
    const proCount = product.count
    const proId = product.productId 
    
    const updatedOrder = await Order.findOneAndUpdate(
      {
        userId: Id,
        'products._id': id
      },
      {
        $set: {
          'products.$.status': 'Product Returned',
          'products.$.returnReason': reason
        }
      },
      { new: true }
    );

    if(updatedOrder){

      await Product.findByIdAndUpdate({_id:proId},{$inc:{StockQuantity:proCount}})
      await User.findByIdAndUpdate({_id:Id},{$inc:{wallet:returnAmount}})
      res.redirect("/vieworder/" + ordersId)
    }else{
       res.redirect("/vieworder/" + ordersId)
    }
   

  } catch (error) {
    next(error);
  }
}




  module.exports={
    loadcheckOut,
    placeOrder,
    loadOrders,
    loadDetailedView,
    CancelOrder,
    loadOrderAdmin,
    loadViewSingleAdmin,
    changeStatus,
    verifyPayment ,
    returnOrder
  }