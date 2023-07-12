const mongoose= require("mongoose")

const categorySchema= new mongoose.Schema({
    category_name: {
        type:String,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('category',categorySchema);