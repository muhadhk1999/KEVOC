const mongoose = require("mongoose")


const offerSchema = new mongoose.Schema({
    offerName : {
        type : String,
        
     },
     offPrice : {
        type : Number,
     //    default:0
     },
     is_delete : {
        type : Boolean,
        default : false
     },
})

module.exports = mongoose.model('offer',offerSchema);