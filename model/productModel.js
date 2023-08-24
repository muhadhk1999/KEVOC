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
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
      },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'offer'
      },
      
    image:{
        type:Array,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    },
   
    // Status:{
    //     type:Boolean,
    //     default:true
    // }
})
productSchema.index({ product_title: 'text' });
module.exports=mongoose.model('product',productSchema);