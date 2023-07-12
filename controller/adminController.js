const session = require("express-session")
const User=require("../model/userModel")
const bcrypt=require('bcrypt')


//=====================LOGIN PAGE LOADING==================//


const loadLogin=async(req,res,next)=>{
     
    try {
        res.render('login')
    } catch (error) {
        next(error)
    }


}

//============================VERIFYING LOGING PAGE=================//

const verifyLogin= async(req,res)=>{

    try {
        
        const email=req.body.email
        const password=req.body.password
        console.log(email,password);

        const userData= await User.findOne({email:email})

        if(userData){

            const passwordMatch= await bcrypt.compare(password,userData.password)

            if(passwordMatch){
                if(userData.is_admin===0){
                    res.render('login',{message:'Email and password not match'})
                }else{
                    req.session.user_id = userData._id
                    res.redirect('/admin/home')
                }

            }else{
                res.render('login',{message:'Email and password not match'})
            }

        }else{
            res.render('login',{message:'Email and password incorrect'})
        }

    } catch (error) {
        console.log(error.message)
    }


}

//=====================HOME PAGE LOADING=============//

const loadHome= async  (req,res)=>{

    try {
        
        res.render('home')
    } catch (error) {
        console.log(error.message)
    }

}

//============================DASHBORD LOADING==============//

const loadUserList= async  (req,res)=>{

    try {
        const userData = await User.find({is_admin:0})
        res.render('userList',{users:userData})
    } catch (error) {
        console.log(error.message)
    }

}

//============================= BLOCK AND UNBLOCK USER ================================

const block = async (req,res,next)=> {
    try {
      await User.findByIdAndUpdate(req.query.id,{$set:{is_block:true}})
      req.session.user = null
      res.redirect("/admin/userList")
    } catch (error) {
      next(error);
    }
}
const unblock = async (req,res,next)=> {
    try {
      await User.findByIdAndUpdate(req.query.id,{$set:{is_block:false}})
      
      res.redirect("/admin/userList")
    } catch (error) {
      next(error);
    }
}




module.exports={
    loadLogin,
    verifyLogin,
    loadHome,
    loadUserList,
    block,
    unblock,
}