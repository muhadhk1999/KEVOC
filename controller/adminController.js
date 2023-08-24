const User=require("../model/userModel")
const bcrypt=require('bcrypt')
const Category = require("../model/categoryModel")
const Order = require("../model/orderModel")


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

        const userData= await User.findOne({email:email})

        if(userData){

            const passwordMatch= await bcrypt.compare(password,userData.password)

            if(passwordMatch){
                if(userData.is_admin===0){
                    res.render('login',{message:'Email and password not match'})
                }else{
                    req.session.Auser_id = userData._id
                    res.redirect('/admin/dashbord')
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

// //=====================HOME PAGE LOADING=============//

// const loadHome= async  (req,res)=>{

//     try {
        
//         res.render('dashbord')
//     } catch (error) {
//         console.log(error.message)
//     }

// }

//============================USER LIST  LOADING==============//

const loadUserList= async  (req,res)=>{

    try {
        const userData = await User.find({is_admin:0})
        const adminData = await User.findById({ _id: req.session.Auser_id });
        
        res.render('userList',{users: userData,admin:adminData})
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


//======================================LOAD DASHBORD================================================================//

const loadDashbord= async (req,res,next)=>{
    try {
        const catData = await Category.find({is_delete:false})
        const aggregationPipeline = [
          // Total Sales Amount
          {
            $facet: {
              totalSales: [
                { $unwind: "$products" },
                { $match: { "products.status": "Delivered", paymentMethod: "Wallet" } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$products.totalPrice" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    total: 1,
                  },
                },
              ],
              CODTotal: [
                // Total COD
                { $unwind: "$products" },
                { $match: { "products.status": "Delivered", paymentMethod: "COD" } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$products.totalPrice" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    total: 1,
                  },
                },
              ],
              onlinePaymentTotal: [
                // Total Online Payment
                { $unwind: "$products" },
                { $match: { "products.status": "Delivered", paymentMethod: "onlinePayment"  } },
                {
                  $group: {
                    _id: null,
                    total: { $sum: "$products.totalPrice" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    total: 1,
                  },
                },
              ],
            },
          },
        ];
    
        const [results] = await Order.aggregate(aggregationPipeline);
    
        const total = results.totalSales[0]?.total || 0;
        const codTotal = results.CODTotal[0]?.total || 0;
        const onlineTotal = results.onlinePaymentTotal[0]?.total || 0;

        res.render('dashbord', { cat:catData,total,codTotal,onlineTotal })
    } catch (error) {
        next(error)
    }
}
//========================================LOAD SALES REPORT============================================================//

const loadSalesReport = async (req,res,next) => {
    try {
     
      const order = await Order.aggregate([
        { $unwind: "$products" },
        { $match: { 'products.status': 'Delivered' } },
        { $sort: { date: -1 } },
        {
          $lookup: {
            from: 'products',
            let: { productId: { $toObjectId: '$products.productId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
            ],
            as: 'products.productDetails'
          }
        },  
        {
          $addFields: {
            'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
          }
        }
      ]);

      console.log(order);
  
      res.render('salesReport',{
        order
      })
    } catch (error) {
      next(error);
    }
  }

  //======================================SALE SORT=================================================================//
  
  const salesSort = async(req,res,next) =>{
    try {
      const adminData = await User.findById({ _id: req.session.Auser_id });
      const id = parseInt(req.params.id);
      const from = new Date();
      const to = new Date(from.getTime() - id * 24 * 60 * 60 * 1000);
      
      const order = await Order.aggregate([
        { $unwind: "$products" },
        {$match: {
          'products.status': 'Delivered',
          $and: [
            { 'products.deliveryDate': { $gt: to } },
            { 'products.deliveryDate': { $lt: from } }
          ]
        }},
        { $sort: { date: -1 } },
        {
          $lookup: {
            from: 'products',
            let: { productId: { $toObjectId: '$products.productId' } },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$productId'] } } }
            ],
            as: 'products.productDetails'
          }
        },  
        {
          $addFields: {
            'products.productDetails': { $arrayElemAt: ['$products.productDetails', 0] }
          }
        }
      ]);
  
      res.render("salesReport", { order ,admin:adminData });
     
    } catch (error) {
      next(error);
    }
  }



//=======================================DASHBORD SORT BY DATE===========================================================//






module.exports={
    loadLogin,
    verifyLogin,
    // loadHome,
    loadUserList,
    block,
    unblock,
    loadDashbord,
    loadSalesReport,
    salesSort,
  
}