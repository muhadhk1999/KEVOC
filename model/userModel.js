const mongoose = require('mongoose')

const Userschema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        default:0
    },
    is_verified:{
        type:Number,
        default: 0
    },
    is_block:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('User',Userschema)