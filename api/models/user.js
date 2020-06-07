const mongoose = require('mongoose');
const Order = require('./order');
const Basket = require('./basket');
const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {
        type : String,
        required : true,
        unique : true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password : {
        type : String,
        required : true
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    orders :[{
        type : mongoose.Schema.Types.ObjectId,
         ref : 'Order'
    }],
    basket : {
        type : Basket.schema
    }
});

module.exports = mongoose.model('User',userSchema);