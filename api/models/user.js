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
    firstName  :{
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    addresses : [{
        country : String,
        city : String,
        street : String,
        building :String,
        floor : String,
        GMLocation : String,
        AdditionalInfo: String
    }],
    images : [{type : String}],
    orders :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Order',
        autopopulate : true
    }],
    basket : {
        type : Basket.schema
    },

});

module.exports = mongoose.model('User',userSchema);