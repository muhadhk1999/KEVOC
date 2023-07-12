const { ObjectId } = require('mongodb');
const mongoose= require("mongoose")

const productSchema= new mongoose.Schema({
    product_title: {
        type:String,
        required:true
    },
    product_price: {
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    product_size:{
        type:String,
        required:true
    },
    StockQuantity:{
        type:Number,
        required:true
    },
    Category : { 
        type :  mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Catagory"
    },
    image:{
        type:Array,
        required:true
    }

})

module.exports=mongoose.model('product',productSchema);