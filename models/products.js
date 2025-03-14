const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const productSchema = mongoose.Schema(
    {
        _id:{ 
            type: String, 
            default: uuidv4 
        }, 
        productID:{
            type:String,
        },
        instock:{
            type:Boolean,
            default:true
        },
        currentStock:{
            type:Number,
        },
        pname:{
            type:String,
        },
        price:{
            type:Number,
        },
        color:{
            type:String,
        },brand:{
            type:String,
        },
    },  
    {timestamps:true}
);

module.exports = mongoose.model('product',productSchema);  