const mongoose = require('mongoose');
const Product = require('./product');
const User = require('./user');
// const User = mongoose.model('User');

const orderSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    products : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Product',
        required : true,
        autopopulate : true
    }],
    quantity: {
        type : Number,
        default : 1
    },
    netTotal : {
        type : Number,
        default : 0
    },
    user:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
},{timpestamps : true});

orderSchema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Order',orderSchema);