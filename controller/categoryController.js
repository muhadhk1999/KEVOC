const session = require("express-session")
const Category=require("../model/categoryModel")
const bcrypt=require('bcrypt')

//====================CATEGORY PAGE RENDERING==========//

const loadCategory= async  (req,res)=>{

    try {
        const cat=await Category.find()
        res.render('category',{Category:cat})
    } catch (error) {
        console.log(error.message)
    }

}

const addCategory= async (req,res,next)=>{
    try {
        const name=req.body.category
        const existingCategory= await Category.findOne({category_name:name})
        if(existingCategory){
            message= "category exist"
            res.redirect('/admin/category')
            return
        }
        const category= new Category({
            category_name:name
        })
        await category.save()
        res.redirect('/admin/category')

    } catch (error) {
        next(error)
    }
}
//============== LIST AND UNLIST CATEGORY ==============

const unlistCategory = async (req, res,next) => {
    try {
        const categoryData = await Category.findByIdAndUpdate(req.query.id,{$set:{is_delete : true}})
        res.redirect("/admin/category")
    } catch (error) {
        next(error);
    }
     
  };
const listCategory = async (req, res,next) => {
    try {
        const categoryData = await Category.findByIdAndUpdate(req.query.id,{$set:{is_delete : false}})
        res.redirect("/admin/category")
    } catch (error) {
        next(error);
    }
     
  };
//================== UPDATE AND SAVE==========

const editCategory = async(req,res,next) =>{
    try {
        const id = req.params.id
        const name = req.body.categoryName
        
        const catData = await Category.findOneAndUpdate({_id:id}  ,{$set:{category_name:name}});
        
        if(catData){
            res.redirect('/admin/category')
        }
    } catch (error) {
        next(error);
    }
}
module.exports= {
    loadCategory,
    addCategory,
    listCategory,
    unlistCategory,
    editCategory
}