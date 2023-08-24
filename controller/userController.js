const User=require("../model/userModel")
const Product=require("../model/productModel")
const bcrypt=require("bcrypt")
const nodemailer=require("nodemailer")
const passwordValidator= require('password-validator')
const Category=require("../model/categoryModel")
const Address=require("../model/addressModel")
const Offer=require("../model/offerModel")



//===================VALIDATING PASSWORD=======================//
var schema = new passwordValidator();


schema
.is().min(8)                        
.is().max(100)                        
.has().uppercase()                             
.has().lowercase()                             
.has().digits(2)                               
.has().not().spaces()  



//====================BCRYPT==================================//
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (err) {
    console.log(err.message);
  }
};


//===================HOME PAGE LOAD===========//
async function loadHome(req, res, next) {
  try {
    if (req.session.user_id) {
      res.render("home");
    } else {
      res.render("home");
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
}
  

  //================LOGIN PAGE LOAD==============//

  const loginLoad = async (req,res,next)=>{
    try {
        if(req.session.user_id){
            res.render('home')
        }
        else{
            res.render('login')
        }
    } catch (error) {
        next(error)
    }
  }

  //==============REGISTRATION PAGE LOAD=======//


  const loadRegister= async(req,res,next)=>{
    try {
        res.render('registration')
    } catch (error) {
        next(error)
    }
  }

//==================RGISTERING USER=============//

const insertUser = async (req, res, next) => {
  try {
    const userWithEmail = await User.findOne({ email:req.body.email });
  const userWithMobile = await User.findOne({ mobile: req.body.mobile});
  const userWithUsername = await User.findOne({ name: req.body.name });

  if (userWithEmail) {
    return res.render("registration", { message: "Email already exists." });
  }

  if (userWithMobile) {
    return res.render("registration", { message: "Mobile number already exists." });
  }

  if (userWithUsername) {
    return res.render("registration", { message: "Username already exists." });
  }
  const password=req.body.password  
  const passStrong = await schema.validate(password)

    if (!passStrong) {
      res.render("registration", {message: "Add minimum 8 charectors,includes uppercase,lovercase,and atleast 20digits",});
      return
    }
  const spassword = await securePassword(password)
      const user = new User({
        name: req.body.name,
        mobile: req.body.mobile,
        email: req.body.email,
        password: spassword,
        is_admin: 0,
      });
      const userData = await user.save();
      email=req.body.email
      console.log(user)
      // check if email, mobile, and username already exist
  

      if (userData) {
        // Registration successful
        randomnumber = Math.floor(Math.random() * 9000) + 1000;
        otp = randomnumber;
        console.log(otp);
        sendVerifyMail(req.body.name, req.body.email, randomnumber);
        return res.redirect('/OTP');
      } else {
        return res.render('registration', { message: 'Your registration has failed' });
      }
  } catch (err) {
    next(err);
  }
};




//=======================VERIFY LOGIN======================//



  const verifylogin=async (req,res)=>{
    try {
      
        const email=req.body.email
        const password = req.body.password

        const userData = await User.findOne({email:email})

        if(userData){
                const passwordMatch = await bcrypt.compare(password,userData.password)
                if(passwordMatch){
                    if(userData.is_verified===1){
                        req.session.user_id=userData._id
                        res.redirect('/home')
                        
                    }else{
                        res.render('login',{message:'Please check your email'})
                    }
                }else{
                    res.render('login',{message:'E-mail and password incorrect'})
                }
        }else{
            res.render('login',{message:'E-mail and password incorrect'})
        }

    } catch (error) {
        console.log(error.message)
    }
}

//---------------- USER OTP VERIFICATION PAGE SHOWING SECTION START
const loadOtpVerification = async(req,res,next)=>{
  try{
      res.render('OTP');
  }catch(err){
    next(err);
  }
}
//---------------- USER SEND EMAIL VERIFICATION SECTION START
const sendVerifyMail = async (name, email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:  process.env.EMAIL,
        pass:  process.env.PASSWORD,
      }
    });

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Verification Email',
      html: `<p>Hi ${name}, please click <a href="http://localhost:3000/otp">here</a> to verify and enter your verification email. This is your OTP: ${otp}</p>`
    };

    const info = await transporter.sendMail(mailOption);
    console.log("Email has been sent", info.response);

  } catch (error) {
    console.log(error.message);
  }
};



//======================== LOAD FORGOT PASSWORD ===================
const forgotPassword = async (req,res,next) =>{
  try {
    res.render("forgotPassword")
  } catch (error) {
    next(error);
  }
}

//======================== SEND OTP FORGOT PASSWORD ===================

let otpv;
let emailv;
const forgotVerifyMail = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    const name = userData.name;
    if (userData) {
      randomnumber = Math.floor(Math.random() * 9000) + 1000;
      otpv = randomnumber;
      emailv = email; 
      sendVerifyMail(name, email, randomnumber);
      res.render("forgotPassword", { message1: "please check your email" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//======================== VERIFY OTP ===================

const verifyForgotMail = async (req, res) => {
  try {
    const otp = req.body.otp;
    if (otp == otpv) {
      res.render("resubmitPassword");
    } else {
      res.render("forgotPassword", { message2: "otp is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//========================RESUBMIT PASSWORD PAGE RENDERING AND WORKINFG=======================================//

const resubmitPassword = async (req, res,next) => {
  try {
    if (req.body.password != req.body.password2) {
      res.render("resubmitPassword", {
        message: "Password Not Matching",
      });
      return;
    }
    const passwordValidate = await schema.validate(req.body.password);

    if (!passwordValidate) {
      res.render("resubmit-password", {
        message: "Password Must Be Strong",
      });
      return;
    }

    const spassword = await securePassword(req.body.password);

    const changePassword = await User.findOneAndUpdate(
      { email: emailv },
      { $set: { password: spassword } }
    );

    if (changePassword) {
      res.render("resubmitPassword", {
        message: "Password successfully changed",
      });
    } else {
      res.render("resubmitPassword", {
        message: "Please try again!!",
      });
    }
  } catch (error) {
    next(error);
  }
};

//========================================= USER EMAIL VERIFICATION SECTION START===========================================//

const verifyEmail = async (req,res,next)=>{
  const otp2= req.body.otp;
  try { 
      if(otp2==otp){
          const UserData = await User.findOneAndUpdate({email:email},{$set:{is_verified:1}});
          if(UserData){
            res.redirect("/login");
          }
          else{
              console.log('something went wrong');
          }
      }
      else{
          res.render('otpVerificaton',{message:"Please Check the OTP again!"})
      }
  } catch (err) {
    next(err);
  }
}

//===============================================PRODUCT PAGE RENDERING==================================================//

const loadProduct= async  (req,res)=>{

  try {
    const id = req.params.id
    const productData = await Product.findById(id)
    .populate('offer')
    .exec();
    const offer = await Offer.find({ is_delete: false })
      res.render('product',{product:productData,offer:offer})
  } catch (error) {
      console.log(error.message)
  }

}

//============================================SHOP PAGE RENDERING=========================================================//

const loadShop = async(req,res) =>{
  try {
    const productdata = await Product.find({ is_delete: false } )
    .populate('offer')
    .exec();
    const offer = await Offer.find({ is_delete: false })

    const session = req.session.user_id;
    const catData = await Category.find({ is_delete: false });
    let userdata = null;

    if (req.session.user_id) {
      userdata = await User.findById(req.session.user_id);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const productCount = productdata.length;
    const totalPages = Math.ceil(productCount / limit);
    const paginatedProducts = productdata.slice(startIndex, endIndex);

    res.render("shop", {
      userData: userdata,
      category: catData,
      session,offer,
      productData: paginatedProducts,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    next(error);
  }
};

// ================================== LAOAD PROFILE =====================================================================//

const loadProfile = async (req, res,next) => {
  try {
    if(req.session.user_id){
      const session = req.session.user_id
      const address= await Address.findById()
      const userdata = await User.findById({_id: req.session.user_id})
      res.render("profile", { userData: userdata,session,address });
    }else{
      res.redirect("/home",{message:"please login"})
    }
    
    
  } catch (error) {
    next(error);
  }
};

//===============================================EDIT PASSWORD PAGE RENDERING=============================================//

const loadeditPassword= async(req,res)=>{

  try {
    // if(req.session.user_id){
      res.render('editPassword')
    // }
  } catch (error) {
    next(error)
  }

}

//==================================================CART PAGE RENDERING====================================================//

// const loadCart= async(req,res,next)=>{
//   try {
      
//       res.render('cart')
//   } catch (error) {
//       next(error)
//   }
// }



//==================================================EDIT PROFILE PAGE==========================================================//

const editProfile=async(req,res,next)=>{
  try {
    const id=req.session.user_id
    const updatedProfile=await User.findByIdAndUpdate(id,{
      $set:{
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mobile
      }
      
    })
    if(updatedProfile){
      res.redirect('/profile')
    }
    else{
      res.redirect('/profile')
    }
  } catch (error) {
    next(error)
  }
}

//==================================================RESET PASSWORD======================================================//

const resetPassword = async(req,res,next)=>{

      try {
        const password1 = req.body.password1
        const password2 = req.body.password2
        const password3 = req.body.password3

        console.log(password1);
        
        const id = req.session.user_id
        const userData = await User.findById(id)
        console.log(userData);
        if(userData){
          const passwordMatch = await bcrypt.compare(password1,userData.password)
          console.log(passwordMatch);
              if(passwordMatch){
                  if(password2 == password3){
                    const spassword = await securePassword(password3)
                    req.session.destroy()
                    res.redirect("/profile")
                  }else{
                    res.render('editPassword',{message:"Your password is not same"})
                  }
              }else{
                    res.render('editPassword',{message:"Your Current password is incorrect"})
                
              }
        }else{
          res.redirect("/home")
        }

        

      } catch (error) {
        next(error)
      }
}

//========================================================LOGOUT==========================================================//

const logout= async(req,res)=>{
  try {
      req.session.destroy()
      res.rendirect('/home')
  } catch (error) {
      console.log(error.message)
  }
}



//======================================= FILTER BY CATEGORY =============================================================//

const filterByCategory =async (req,res,next)=>{
  try {
    const id = req.params.id
    const session = req.session.user_id
    const catData = await Category.find({is_delete:false })
    const userData = await User.find({})
    const productData = await Product.find({category:id,is_delete:false }).populate('category')
    
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const productCount = productData.length;
    const totalPages = Math.ceil(productCount / limit);
    const paginatedProducts = productData.slice(startIndex, endIndex);
    if (catData.length > 0) {
      res.render("shop",{session,userData:userData,productData:paginatedProducts,currentPage: page,
        totalPages: totalPages,
        category:catData,})
    } else {
      res.render("shop",{session,userData:userData,productData:[],category:catData,currentPage: page,
        totalPages: totalPages,})

    }
  } catch (error) {
    next(error);
  }
}
//===================== SEARCH PRODUCT IN SHOP ===============================================================================//


const searchProduct = async (req, res, next) => {
  try {
    const searchData = req.body.search;
    const search = searchData.trim();
    const session = req.session.user_id;

    const userData = await User.find({});
    const categoryData = await Category.find({ is_delete: false });

    // Use MongoDB's $text operator for text search relevance
    const productData = await Product.find(
      { $text: { $search: search } },
      { score: { $meta: 'textScore' } } // Get relevance score
    )
      .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
      .limit(10); // Limit results

    if (productData.length > 0) {
      const page = parseInt(req.query.page) || 1;
      const limit = 4;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const productCount = productData.length;
      const totalPages = Math.ceil(productCount / limit);
      const paginatedProducts = productData.slice(startIndex, endIndex);

      res.render('shop', {
        session,
        category: categoryData,
        productData: paginatedProducts,
        userData,
        currentPage: page,
        totalPages,
      });
    } else {
      res.render('shop', {
        session,
        category: categoryData,
        productData: [],
        userData,
        currentPage: 1,
        totalPages: 1,
      });
    }
  } catch (error) {
    next(error);
  }
};


//==========================================PRICE SORT=================================================================//

const priceSort = async(req,res,next) => {
  try {
    const id = req.params.id
    const session = req.session.user_id;
     const userData = await User.find({})
     const categoryData = await Category.find({is_deleted:false});
     const productData = await Product.find({ is_delete: false }).populate('category').sort({product_price: id})

     const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const productCount = productData.length;
    const totalPages = Math.ceil(productCount / limit);
    const paginatedProducts = productData.slice(startIndex, endIndex);
    if (productData){
      res.render('shop',{session,category:categoryData,productData:paginatedProducts,userData:userData,currentPage: page,
        totalPages: totalPages,});
    }else {
      res.render('shop',{session,category:categoryData,productData:paginatedProducts,userData:userData,currentPage: page,
        totalPages: totalPages,});
    }

  } catch (error) {
    next(error);
  }
  

}


//=========================================================================//

  module.exports= {
    loadHome,
    loginLoad,
    loadRegister,
    insertUser,
    verifylogin,
    loadOtpVerification ,
    verifyEmail,
    loadProduct,
    loadShop,
    loadProfile,
    loadeditPassword,
    editProfile,
    resetPassword,
    logout,
    filterByCategory,
    forgotPassword,
    forgotVerifyMail,
    verifyForgotMail,
    resubmitPassword,
    searchProduct,
    priceSort
    
  }