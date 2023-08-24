const session = require("express-session")
const Address=require("../model/addressModel")
const User=require("../model/userModel")
const bcrypt=require('bcrypt');
const { name } = require("ejs");


//===============================================ADD ADDRESS====================================================================//

const addAddress = async (req,res,next) => {
    try {
        console.log(req.body.house-name+'----');
      const addressDetails = await Address.findOne({
        userId: req.session.user_id,
      });
      if (addressDetails) {
        const updateOne = await Address.updateOne(
          { userId: req.session.user_id },
          {
            $push: {
              addresses: {
                userName: req.body.name,
                email: req.body.email2,
                mobile: req.body.mobile2,
                houseName: req.body.housename,
                country: req.body.country,
                city: req.body.city,
                pincode: req.body.pinCode,
                landmark: req.body.landmark
              },
            },
          }
        );
        if (updateOne) {
          res.redirect("/checkOut");
        } else {
          res.redirect("/");
        }
      } else {
        const address = new Address({
          userId: req.session.user_id,
          addresses: [
            {
                userName: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile2,
                houseName: req.body.housename,
                country: req.body.country,
                city: req.body.city,
                pincode: req.body.pinCode,
                landmark: req.body.landmark
            },
          ],
        });
        const addressData = await address.save();
        if (addressData) {
          res.redirect("/checkout");
        } else {
          res.redirect("/checkout");
        }
      }
    } catch (error) {
      next(error);
    }
  };


  //====================================EDIT ADD ADDRESS================================================================//

  const editaddAddress = async (req,res,next) => {
    
    if (
      req.body.name.trim() === "" ||
      req.body.email.trim() === "" ||
      req.body.mobile.trim() === "" ||
      req.body.housename.trim() === "" ||
      req.body.landmark.trim() === "" ||
      req.body.city.trim() === "" ||
      req.body.pinCode.trim() === ""
    ) {
      
      const id = req.params.id;
      const session = req.session.user_id;
      const userData = await User.findOne({ _id: req.session.user_id });
      const addressDetails = await Address.findOne(
        { userId: session },
        { addresses: { $elemMatch: { _id: id } } }
      );
      const address = addressDetails.addresses;
      res.render("checkOut", {
        session,
        userData: userData,
        address: address[0],
      });
    } else {
      try {
        
        const id = req.params.id;
        await Address.updateOne(
          { userId: req.session.user_id, "addresses._id": id },
          {
            $set: {
              "addresses.$": {
                userName: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                houseName: req.body.housename,
                country: req.body.country,
                city: req.body.city,
                pincode: req.body.pinCode,
                landmark: req.body.landmark
              },
            },
          }
        );
        res.redirect("/checkOut");
      } catch (error) {
        next(error);
      }
    }
  };
//================== DELETE ADDRESS ===================

const deleteAddress = async (req,res,next) => {
  try {
    
      const id = req.session.user_id
      const addressId = req.query.id
      
      const addressData = await Address.findOne({userId:id})
      if(addressData.addresses.length === 1){
         const a = await Address.deleteOne({userId:id})
         if(a){

          res.redirect("/checkOut")
         }else{
          res.redirect("/checkOut")
         }
      }else{
      const b =    await Address.updateOne({userId:id},{$pull:{addresses:{_id:addressId}}})
      if(b){

        res.redirect("/checkOut")
       }else{
        res.redirect("/checkOut")
       }
      }
           
  } catch (error) {
      next(error);
      
  }
}


//============================== SHOW ADDRESS IN USER PROFILE =========================================================//

const showAddress = async(req,res,next) =>{
  try {
      const session = req.session.user_id
      const userData = await User.findOne ({_id:req.session.user_id});
      const addressData = await Address.findOne({userId:req.session.user_id});
          if(session){
              if(addressData){
                  const address = addressData.addresses
                  res.render('address',{userData:userData,session,address:address})

              }else{
                  res.render('address',{userData:userData,session})
              }
          }else{
              res.redirect('/home')
          }
  } catch (error) {
      next(error)
  }
}





  module.exports={ 
    addAddress,
    editaddAddress,
    deleteAddress,
    showAddress
  }