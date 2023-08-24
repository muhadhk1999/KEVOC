const mongoose= require("mongoose")

const categorySchema= new mongoose.Schema({
    category_name: {
        type:String,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'offer'
      },
})


const Category=mongoose.model('Category',categorySchema);
module.exports = Category