const mongoose = require('mongoose');
const Product = require('./product');

const basketSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    itemList : [{
        product : {type : mongoose.Schema.Types.ObjectId,
        ref : 'Product'},
        quantity : Number
    }],
    quantity : {
        type: Number,
        default:0
    },
    totalPrice : {
        type : Number,
        default : 0
    }
});

module.exports = mongoose.model('Basket',basketSchema);