const mongoose = require('mongoose');
const Manufacturer = require('./manufacturer');
const User = require('./user');
const Comment = require('./comment')


const commentSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    author : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    text :{
        type : String,
        required : true
    }
    
});


const productSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {
        type : String,
        required : true
    },
    price : {
        type: Number,
        required : true
    },
    productImage : {
        type : String,
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
    category : {
        type : String,
        required : true
    },
    manufacturer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Manufacturer',
        required : true,
        autopopulate : true
    },
    rating : {
        type : Number,
        default : 0
    },
    comments : [{type : mongoose.Schema.Types.ObjectId,ref : 'Comment'}]
});

productSchema.plugin(require('mongoose-autopopulate'));


module.exports = mongoose.model('Product',productSchema);