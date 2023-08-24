const session = require("express-session")
const Category=require("../model/categoryModel")
const Offer=require("../model/offerModel")
const bcrypt=require('bcrypt')
const uc = require ('upper-case')

//=====================================CATEGORY PAGE RENDERING===========================================================//

const loadCategory= async  (req,res)=>{

    try {
        const cat=await Category.find()
        .populate('offer')
        .exec();
        const offer=await Offer.find({is_delete:false})
        res.render('category',{Category:cat,offer:offer})
    } catch (error) {
        console.log(error.message)
    }

}

//========================================ADD CATEGORY PAGE============================================================//

const addCategory= async (req,res,next)=>{
    try {
        const name=uc.upperCase(req.body.category)
        const _id=req.body.offer
        const offer=await Offer.findById(_id)
        const existingCategory= await Category.findOne({category_name:name})
        .populate('offer')
        .exec();
        if(existingCategory){
            message= "category exist"
            res.redirect('/admin/category')
            return
        }
        const category= new Category({
            category_name:name,
            offer:offer
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
//================== EDIT CATEGORTY ==========================================================================//

const editCategory = async(req,res,next) =>{
    try {
        const id = req.params.id
       const _id=req.body.offer
        const name = uc.upperCase (req.body.categoryName)
        const offer=await Offer.findById(_id)
        const catData = await Category.findOneAndUpdate({_id:id}  ,{$set:{category_name:name,
        offer:offer}})
        .populate('offer')
        .exec();
        
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