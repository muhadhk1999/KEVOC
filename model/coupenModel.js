const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    user :{
        type:Array,
        ref:'User'
    },
    couponName :{
        type:String,
        required:true,
    },
    couponCode :{
        type:String,
        required:true,
    },
    discountPercentage:{
        type:Number,
        required:true,
    },
    criteria:{
        type:Number,
        required:true,
    },
    startDate:{
        type:Date,
        required:true,
    },
    expiryDate :{
        type:Date,
        required:true
    },
    // status:{
    //     type:Boolean,
    //     default:false

    // }


})
const couponmodel = mongoose.model("coupon",couponSchema);
module.exports = couponmodel;