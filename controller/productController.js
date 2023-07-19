const session = require("express-session");
const Product=require("../model/productModel");
const Category=require("../model/categoryModel");
const User=require("../model/userModel");
const bcrypt=require('bcrypt');
const { query } = require("express");
const fs = require('fs');
const path = require('path');


//==========================ADD PRODUCT============================//

const addProductLoad= async  (req,res)=>{

    try {
        const category = await Category.find()
        const productData = await Product.find({}).populate("category")


        res.render('addProduct',{category:category,products:productData})
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
    
    const new_product = new Product({
        product_title : req.body.product_title,
        product_price : req.body.product_price,
        image : image,
        
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
        console.log("gggggggggggggggggggggggggggggggggggggggggggggggggg");
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
        const product = await Product.findById(id)
        const category = await Category.find()

        res.render('editProduct',{product:product,category:category})
    } catch (error) {
        console.log(error.message)
    }

}

//=============================================EDIT PRODUCT========================================================//

const editUpdateProduct = async (req,res,next) =>{
    if(req.body.product_title.trim()=== "" || req.body.description.trim() === "" || req.body.StockQuantity.trim() === "" || req.body.product_price.trim() === "" ) {
        const id = req.params.id
        const productData = await Product.findOne({_id:id})
        const categoryData = await Category.find({})
        const adminData = await User.findById({_id:req.session.Auser_id})
        res.render('editProduct',{admin:adminData,products: productData,category:categoryData, message:"All fields required",})
    }else{
        try {
            
            const arrayimg = []
            for(file of req.files){
                arrayimg.push(file.filename)
            }
            const price = req.body.product_price

                
                const id = req.params.id
                await Product.updateOne({_id:id},{$set:{
                    product_title : req.body.product_title,
                    product_price : req.body.product_price,
                    product_size:req.body.product_size,
                    category : req.body.Category,
                    StockQuantity : req.body.StockQuantity,
                    description : req.body.description,
                }})
                res.redirect('/admin/addProduct')
            // }
        } catch (error) {
          next(error);
        }
    }
}

//==========================================DELETE IMAGE IN EDITPRODUCT================================================//

const deleteimage = async(req,res,next)=>{
    try{
        console.log("lllllllllllllllllllllllllllllllllllllllll");
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
  console.log("jhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjhjh");
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

module.exports= {
    addProductLoad,
    insertProduct,
    deleteProduct,
    unduproduct,
    loadeditProduct,
    editUpdateProduct,
    deleteimage,
    updateimage

    
}