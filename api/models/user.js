const mongoose = require('mongoose');
const Order = require('./order');

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
    orders :[{
        type : mongoose.Schema.Types.ObjectId,
         ref : 'Order'
    }]
});

module.exports = mongoose.model('User',userSchema);