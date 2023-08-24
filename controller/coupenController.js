const Coupen=require("../model/coupenModel")



//===========================================LOAD COUPEN PAGE ===========================================================//

const loadCoupen= async(req,res,next)=>{
    try {
        
        const adminData = req.session.Auser_id
        const coupon = await Coupen.find({})
        if(coupon){
            res.render("coupen",{coupons:coupon})
        }else{
            res.render("coupen")
        }
        
    } catch (error) {
        next(error);
    }
}


//===========================================LOAD ADD COUPEN PAGE========================================================//

const loadAddCoupen= async(req,res,next)=>{
    try {
        res.render('createCoupen')
    } catch (error) {
        next(error)
    }
}

//===========================================INSER NEW COUPEN ===========================================================//

const insertCoupon = async(req,res,next)=>{
    try {
        const coupon = new Coupen({
            couponName:req.body.couponName,
            couponCode:req.body.couponCode,
            discountPercentage:req.body.discountPercentage,
            startDate:req.body.startDate,
            expiryDate:req.body.expDate,
            criteria:req.body.criteria,
            status:req.body.status,
    
        })
        const couponData = await coupon.save()
        if(couponData){
            res.redirect("/admin/createCoupen")
        }else{
            res.redirect("/admin/createCoupen")
        }
        
    } catch (error) {
        next(error);
    }
}

//=========================================EDIT COUPEN===================================================================//

const editCoupon = async(req,res,next) => {
    try {
        const id = req.params.id
        const editedCoupon = await Coupen.findByIdAndUpdate({_id:id},{$set:{
            couponName:req.body.couponName.trim(),
            couponCode:req.body.couponCode.trim(),
            discountPercentage:req.body.discountPercentage.trim(),
            startDate:req.body.startDate,
            expiryDate:req.body.expDate,
            criteria:req.body.criteria,
    }})
    if(editedCoupon){
        res.redirect("/admin/coupen")
    }else{
        res.redirect("/admin/coupen")
    }
    } catch (error) {
        next(error);
    }
 }   

//==========================================DELETE COUPEN==============================================================//

const deleteCoupon = async(req,res,next) => {
    try {
        const id = req.body.id
        const DeleteCoupon = await Coupen.findByIdAndDelete(id)
        if(DeleteCoupon){
            res.redirect("/admin/coupen")
        }else{
            res.redirect("/admin/coupen")
        }
    } catch (error) {
        next(error); 
    }
}


//=========================================== APPLY COUPON ==============================================================//

const applyCoupon = async(req,res,next)=>{
    try {
      const code = req.body.code;
     
      const amount = Number(req.body.amount)
      const userExist = await Coupen.findOne({couponCode:code,user:{$in:[req.session.user_id]}})
      if(userExist){
        res.json({user:true})
      }else{
        const coupondata = await Coupen.findOne({couponCode:code})
        if(coupondata){
            if(coupondata.expiryDate <= new Date()){
                res.json({date:true})
            }else{
                if(amount < coupondata.criteria){
                    res.json({notEligible:true})
                }else{
                await Coupen.findOneAndUpdate({_id:coupondata._id},{$push:{user:req.session.user_id}}) 
                const perAmount = Math.round((amount * coupondata.discountPercentage)/100 )
                const disTotal = Math.round(amount - perAmount)
                return res.json({amountOkey:true,disAmount:perAmount,disTotal})
            }
            }
        }
      }
      res.json({invalid:true})
    } catch (error) {
        next(error);
    }
}



module.exports={
    loadCoupen,
    loadAddCoupen,
    insertCoupon,
    editCoupon,
    deleteCoupon,
    applyCoupon
}