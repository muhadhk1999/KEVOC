const session = require("express-session");
const Product=require("../model/productModel");
const Category=require("../model/categoryModel");
const Offer=require("../model/offerModel");
const User=require("../model/userModel");
const { query } = require("express");
const fs = require('fs');
const path = require('path');


//==========================LOAD ADD PRODUCT PAGE============================//

const addProductLoad= async  (req,res)=>{

    try {
        var search=''
        if(req.query.search){
            search=req.query.search
        }

     const p = await Product.find({
        is_delete : true,
        $or:[
            { product_title:{$regex:'.*'+search+'.*'  } }
            ]
    })
        const category = await Category.find()
        const offer = await Offer.find()
        const products = await Product.find({})
        .populate('category')
        .populate('offer') 
        .exec();
      


        res.render('addProduct',{category:category,products:products,offer:offer,p:p})
    } catch (error) {
        console.log(error.message)
    }

}

//=========================INSERT PRODUCT============================//

const insertProduct=async (req,res)=>{
    try {
        const image = [];
        if (req.files && req.files.length > 0) {
        for(i = 0; i < req.files.length; i++){
            image[i] = req.files[i].filename;
        }
    }
    const category = await Category.findById(req.body.Category);
    const offer = await Offer.findById(req.body.offer);
    
    const new_product = new Product({
        product_title : req.body.product_title,
        product_price : req.body.product_price,
        image : image,
        offer : offer,
        product_size:req.body.product_size,
        category : category,
        StockQuantity : req.body.StockQuantity,
        description : req.body.description,

    })
    const productData = await new_product.save();
    if(productData){
        const categoryData = await Category.find({})
       return res.redirect('/admin/addProduct')
    }else{
        return res.redirect('/admin/addProduct')
    }
    } catch (error) {
        console.log(error.message);
    }
}


//========================== SOFT DELETE PRODUCT =================================//

const deleteProduct = async (req, res,next) => {
    try {
        const productData = await Product.findByIdAndUpdate(req.params.id,{$set:{is_delete : true}})
        console.log(req.params.id,'hiiiii');
        res.redirect("/admin/addProduct")
    } catch (error) {
        next(error);
    }
     
  };
const unduproduct = async (req, res,next) => {
    try {
        const productData = await Product.findByIdAndUpdate(req.params.id,{$set:{is_delete : false}})
        res.redirect("/admin/addProduct")
    } catch (error) {
        next(error);
    }
     
  };


//========================================EDIT PRODUCT PAGE LOADING========================================//  

const loadeditProduct= async  (req,res)=>{

    try {
        const id = req.params.id
        const offer = await Offer.find();
        const product = await Product.findById(id)
        .populate('offer') 
        .exec();
        const category = await Category.find()
        


        res.render('editProduct',{product:product,category:category,offer:offer})
    } catch (error) {
        console.log(error.message)
    }

}

//=============================================EDIT PRODUCT========================================================//

const editUpdateProduct = async (req, res, next) => {
  try {
      const id = req.params.id;
      const { product_title, description, StockQuantity, product_price, product_size, Category, offer } = req.body;

      if (product_title.trim() === "" || description.trim() === "" || StockQuantity.trim() === "" || product_price.trim() === "") {
          const productData = await Product.findOne({ _id: id });
          const categoryData = await Category.find({});
          const offerData = await Offer.find({});
          const adminData = await User.findById({ _id: req.session.Auser_id });

          return res.render('editProduct', {
              admin: adminData,
              product: productData,
              category: categoryData,
              offer: offerData,
              message: "All fields required"
          });
      }

      const arrayimg = [];
      for (const file of req.files) {
          arrayimg.push(file.filename);
      }

      // Fetch the offer data from the Offer model based on the selected offer ID
      const selectedOffer = await Offer.findById(offer);

      await Product.updateOne({ _id: id }, {
          $set: {
              product_title: product_title,
              product_price: product_price,
              product_size: product_size,
              category: Category,
              offer: selectedOffer, // Update the offer field with the selected offer
              StockQuantity: StockQuantity,
              description: description,
              images: arrayimg // Assuming you have an "images" field for storing image filenames
          }
      });

      return res.redirect('/admin/addProduct');
  } catch (error) {
      next(error);
  }
};



//==========================================DELETE IMAGE IN EDITPRODUCT================================================//

const deleteimage = async(req,res,next)=>{
    try{
     const imgid =req.params.imgid
     const prodid =req.params.prodid
     console.log(imgid);

     fs.unlink(path.join(__dirname,"../public/adminAssets/adminImages/",imgid),()=>{})
     const productimg  = await  Product.findByIdAndUpdate(prodid,{$pull:{image : imgid}})
 
     res.redirect(`/admin/editProduct/${prodid}`)
 
 
 
   }catch(error){
     next(error)
   }
 
 }
 const updateimage = async (req, res,next) => {

    try {
      const id = req.params.id
      const prodata = await Product.findOne({ _id: id })
      const imglength = prodata.image.length
  
      if (imglength <= 10) {
        let images = []
        for (file of req.files) {
          images.push(file.filename)
        }
  
        if (imglength + images.length <= 10) {
  
          const updatedata = await Product.updateOne({ _id: id }, { $addToSet: { image: { $each: images } } })
  
          res.redirect("/admin/editProduct/" + id)
        } else {
  
          const productData = await Product.findOne({ _id: id }).populate('category')
          const adminData = await User.findById({_id:req.session.Auser_id})
          const categoryData = await Category.find()
          res.render('editProduct', { admin:adminData,product: productData, category: categoryData , imgfull: true})
  
        }
  
      } else {
        res.redirect("/admin/editProduct/")
      }
  
    } catch (error) {
      next(error);
    }
  
  }

  //===================== SEARCH PRODUCT IN ADMIN ADD PRODUCT ===============================================================================//


const searchProduct = async (req,res,next)=>{
    try{
       const searchData = req.body.search;
       const search = searchData.trim()
    //    const session = req.session.user_id;
       const categoryData = await Category.find({is_delete:false});
        const productData = await Product.find({product_title:{$regex: `^${search}`,$options:'i'}});    
     
       if(productData.length > 0){
        res.render('addProduct',{
          category:categoryData,
          products:productData,
          });
       }else{
        res.render('addProduct',{
          category:categoryData,
          products:productData,
          
          });
       }
  
    }catch(error){
      next(error);
    }
  }


 //==========================================PRICE SORT IN ADMIN ADD PRODUCT================================================================//

const priceSort = async(req,res,next) => {
    try {
      const id = req.params.id
    //   const session = req.session.user_id;
       const categoryData = await Category.find({is_deleted:false});
       const productData = await Product.find({ is_delete: false }).populate('category').sort({product_price: id})
  
      
      if (productData){
        res.render('addProduct',{category:categoryData,products:productData});
      }else {
        res.render('addProduct',{category:categoryData,products:productData});
      }
  
    } catch (error) {
      next(error);
    }
    
  
  } 


//===========================================FILTER BY CATEGORY IN ADMIN ADD PRODUCT======================================//

//   const filterByCategory =async (req,res,next)=>{
//     try {
//       const id = req.params.id
//     //   const session = req.session.user_id
//       const catData = await Category.find({is_delete:false })
//       const productData = await Product.find({category:id,is_delete:false }).populate('category')
      
      
//       if (catData.length > 0) {
//         res.render("addProduct",{productData:productData,category:catData,})
//       } else {
//         res.render("addProduct",{productData:[],category:catData})
  
//       }
//     } catch (error) {
//       next(error);
//     }
//   }

module.exports= {
    addProductLoad,
    insertProduct,
    deleteProduct,
    unduproduct,
    loadeditProduct,
    editUpdateProduct,
    deleteimage,
    updateimage,
    searchProduct,
    priceSort,
    // filterByCategory

    
}