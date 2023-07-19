const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
 

const addressSchema= new mongoose.Schema({
    userId:{
        type:ObjectId,
        require:true
    },
    addresses:[{
        userName:{
            type:String,
            required:true,
        },
        mobile:{
            type:Number,
            required:true,
        },
        houseName:{
           type:String,
           required:true,
        },
        city:{
          type:String,
          required:true,
        },
        email:{
            type:String,
            required:true,
        },
        pincode:{
            type:Number,
            required:true,
        },
        landmark:{
            type:String,
            required:true,
        },
    }]
})

const Address= mongoose.model('address',addressSchema)

module.exports= Address