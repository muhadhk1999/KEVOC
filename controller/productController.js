const session = require("express-session")
const Product=require("../model/productModel")
const Catagory=require("../model/categoryModel")
const bcrypt=require('bcrypt')


//==========================ADD PRODUCT============================//

const addProductLoad= async  (req,res)=>{

    try {
        const category = await Catagory.find()
        const productData = await Product.find({})

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
    const category = await Catagory.findById(req.body.Category);
    
    const new_product = new Product({
        product_title : req.body.product_title,
        product_price : req.body.product_price,
        image : image,
        
        product_size:req.body.product_size,
        Category : category,
        StockQuantity : req.body.StockQuantity,
        description : req.body.description,

    })
    const productData = await new_product.save();
    if(productData){
        // const categoryData = await categorymodel.find({})
       return res.redirect('/admin/addProduct')
    }else{
        return res.redirect('/admin/addProduct')
    }
    } catch (error) {
        console.log(error.message);
    }
}





module.exports= {
    addProductLoad,
    insertProduct
    
}