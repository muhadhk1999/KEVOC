const User = require("../model/userModel")
const Product = require("../model/productModel")
const Wishlist = require("../model/whishlistModel")
const Cart = require("../model/cartModel")

//================= LOAD WISHLIST ==================

const loadWishlist = async (req, res, next) => {
  try {
      const session = req.session.user_id;
      const userData = await User.findById(session);
      const wishlistData = await Wishlist.findOne({ userId: session }).populate("products.productId");

      const products = wishlistData ? wishlistData.products.map(wish => wish.productId) : [];

      res.render("whishlist", {
          products,
          wishlist: wishlistData ? wishlistData.products : [],
          userData,
          session
      });
  } catch (error) {
      next(error);
  }
}



// ================ ADD TO WISHLIST =============

const addToWishlist = async(req,res,next) => {
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId });

        const productId = req.body.id        
        const wishlistData = await Wishlist.findOneAndUpdate({userId:userId})
            
            if(wishlistData){
                const checkEmpty = wishlistData.products.findIndex((wishlist) => 
                wishlist.productId == productId
                )
                if(checkEmpty != -1){
                    res.json({check:true});
                }else{
                    await Wishlist.updateOne({userId:userId},{
                        $push:{products:{productId:productId}}
                    })
                    res.json({success:true})
                }
            }else{
                const wishlist = new Wishlist({
                    userId:userId,
                     userName:userData.name,
                     products:[{
                         productId : productId
                     }]

                })
                const wish = await wishlist.save()
                if(wish){
                    res.json({success:true})
                        }
            
                }
            
    } catch (error) {
      next(error);
    }
}

// =================== ADD PRODUCT WISHLIST TO CART ====================

const addToCartFromWish = async (req, res,next) => {
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
  
      let newPrice;

      if(productData.offPrice > 0){
        newPrice = productData.offPrice
      }else{
        newPrice = productData.price
      }
      if (cartProduct) {
        await Cart.updateOne(
          { userId: userId, "products.productId": productId },
          {
            $inc: {
              "products.$.count": 1,
              "products.$.totalPrice": newPrice,
            },
          }
        );
      } else {
        cartData.products.push({
          productId: productId,
          productPrice: newPrice,
          totalPrice: newPrice,
        });
        await cartData.save();
      }
  
      res.json({ success: true });
    } catch (error) {
      next(error);
      
    }
  }

  //======================= DELETE PRODUCT FROM WISHLIST ==================
const deleteWishlist = async(req,res,next)=>{
  try{
   const id = req.session.user_id
   const proid = req.body.product
   const wishlistData = await Wishlist.findOne({userId:id});

   if (wishlistData.products.length === 1) {
        await ishlist.deleteOne({userId:id})
        
   } else {
    const found = await Wishlist.updateOne({userId:id},{$pull:{products:{productId:proid}}})
   }
    res.json({success:true})

      
  }catch(error){
    next(error);
  }
  
}
module.exports = {
    loadWishlist,
    addToWishlist,
    addToCartFromWish,
    deleteWishlist,

}