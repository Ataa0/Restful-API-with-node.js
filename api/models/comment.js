const mongoose = require('mongoose');
const User = require('./user');


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

module.exports = mongoose.model('Comment',commentSchema);
