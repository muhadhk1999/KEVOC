const Offer = require('../model/offerModel')
const uc = require ('upper-case')



//======================= ADD OFFER ==============//

const addOffer = async(req,res,next)=>{
    try {
        const name = uc.upperCase (req.body.offName)
        const productOffer = new Offer({
            offerName:name,
            offPrice:req.body.offPrice,
            
    
        })
        const offerData = await productOffer.save()
        if(offerData){
            res.redirect("/admin/productOffer")
        }else{
            res.redirect("/admin/productOffer")
        }
        
    } catch (error) {
        next(error);
    }
}


//========================================LOAD PRODUCT OFFER PAGE==========================================================//

const loadProductOffer = async(req,res,next)=>{
    try {
        const offer= await Offer.find()
        res.render("productOffer",{offer})
    } catch (error) {
        next(error)
    }
}
//============== LIST AND UNLIST OFFER ==========================================================================//

const unlistoffer = async (req, res,next) => {
    try {
        const offerData = await Offer.findByIdAndUpdate(req.query.id,{$set:{is_delete : true}})
        res.redirect("/admin/productOffer")
    } catch (error) {
        next(error);
    }
     
  };
const listoffer = async (req, res,next) => {
    try {
        const offerData = await Offer.findByIdAndUpdate(req.query.id,{$set:{is_delete : false}})
        res.redirect("/admin/productOffer")
    } catch (error) {
        next(error);
    }
     
  };

//================== EDIT OFFER ===============================================================================//

const editOffer = async(req,res,next) =>{
    try {
        const id = req.params.id
        const name = uc.upperCase (req.body.offName)
        
        const OffData = await Offer.updateOne({_id:id},{$set:{
            offerName : name,
            offPrice : req.body.offPrice,
            
        }})
        
        if(OffData){
            res.redirect('/admin/productOffer')
        }
    } catch (error) {
        next(error);
    }
}


module.exports={
    addOffer,
    loadProductOffer,
    unlistoffer,
    listoffer,
    editOffer   
}