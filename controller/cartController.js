const Cart = require("../model/cartModel");
const session = require ('express-session')
const User = require("../model/userModel");
const Product = require("../model/productModel");


//================== LOAD CART PAGE ===============

const loadCart = async (req, res,next) => {
    try {
      let id = req.session.user_id;
      const session = req.session.user_id;
      let userName = await User.findById({ _id:id });
  
      let cartData = await Cart.findOne({ userId: id }).populate("products.productId");
      if (id) {
          if(cartData){
        if (cartData.products.length > 0) {
          const products = cartData.products;
          const total = await Cart.aggregate([
            { $match: { userId: id } },
            { $unwind: "$products" },
  
            {
              $group: {
                _id: null,
                total: {
                  $sum: {
                    $multiply: ["$products.productPrice", "$products.count"],
                  },
                },
              },
            },
          ]);
  
          const Total = total.length > 0 ? total[0].total : 0;
          
          const totalAmount = Total;
          const userId = userName._id;
          
          res.render("cart", {
            products: products,
            Total: Total,
            userId,
            session,
            totalAmount,
            userData:userName
          });
        } else {
          res.render("cart", {
             
          userData: userName,
          session,
          message: "No Products Added to Cart",
          products:[]
          });
        }
      }else{
          res.render("cart", {
              
              userData: userName,
              session,
              message: "No Products Added to Cart",
              products:[]
              });
      }
      } else {
          res.redirect("/login");
  
      }
    } catch (error) {
      next(error);
    }
  };

const addToCart = async (req, res,next) => {
    try {
      const userId = req.session.user_id;
      const userData = await User.findOne({ _id: userId });
      
      const productId = req.body.id;
      const productData = await Product.findOne({ _id: productId });
  
      const productQuantity = productData.StockQuantity;
  
      const cartData = await Cart.findOneAndUpdate(
        { userId: userId },
        {
          $setOnInsert: {
            userId: userId,
            userName: userData.name,
            products: [],
          },
        },
        { upsert: true, new: true }
      );
  
      const updatedProduct = cartData.products.find((product) => product.productId === productId);
      const updatedQuantity = updatedProduct ? updatedProduct.count : 0;
  
      if (updatedQuantity + 1 > productQuantity) {
        return res.json({
          success: false,
          message: "Quantity limit reached!",
        });
      }
  
      const cartProduct = cartData.products.find((product) => product.productId === productId);
  
//       let newPrice;
  
//   if(productData.offPrice > 0){
//     newPrice = productData.offPrice
//   }else{
//     newPrice = productData.price
//   }
      if (cartProduct) {
        await Cart.updateOne(
          { userId: userId, "products.productId": productId },
          {
            $inc: {
              "products.$.count": 1,
              "products.$.totalPrice": productData.product_price,
            },
          }
        );
      } else {
        cartData.products.push({
          productId: productId,
          productPrice : productData.product_price,
          totalPrice : productData.product_price,
        });
        await cartData.save();
      }
  
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

//============ CHANGE PRODUCT QUANTITY =============

const changeProductCount = async (req, res,next) => {
  try {
    const userData = req.session.user_id;
    const proId = req.body.product;
    let count = req.body.count;
    count = parseInt(count);
    const cartData = await Cart.findOne({ userId: userData });
    const product = cartData.products.find((product) => product.productId === proId);
    const productData = await Product.findOne({ _id: proId });
    
    const productQuantity = productData.StockQuantity
    const updatedCartData = await Cart.findOne({ userId: userData });
    const updatedProduct = updatedCartData.products.find((product) => product.productId === proId);
    const updatedQuantity = updatedProduct.count;
    
    if (count > 0) {
      
      if (updatedQuantity + count > productQuantity) {
        res.json({ success: false, message: 'Quantity limit reached!' });
        return;
      }
    } else if (count < 0) {
     
      if (updatedQuantity <= 1 || Math.abs(count) > updatedQuantity) {
       
        res.json({ success: true });
        return;
      }
    }

    const cartdata = await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $inc: { "products.$.count": count } }
    );
    const updateCartData = await Cart.findOne({ userId: userData });
    const updateProduct = updateCartData.products.find((product) => product.productId === proId);
    const updateQuantity = updateProduct.count;

    let newPrice=productData.product_price;
      console.log(newPrice);
  
    const price = updateQuantity *newPrice;

    await Cart.updateOne(
      { userId: userData, "products.productId": proId },
      { $set: { "products.$.totalPrice": price } }
    );
    
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};


//======================= DELETE PRODUCT FROM CART ==================
const deletecart = async(req,res,next)=>{
  try{
   const id = req.session.user_id
   const proid = req.body.product
   const cartData = await Cart.findOne({userId:id});

   if (cartData.products.length === 1) {
        await Cart.deleteOne({userId:id})
        
   } else {
    const found = await Cart.updateOne({userId:id},{$pull:{products:{productId:proid}}})

   }
    res.json({success:true})   
  }catch(error){
    next(error);
  }
  
}


  module.exports ={
    loadCart,
    addToCart,
    changeProductCount,
    deletecart
  }