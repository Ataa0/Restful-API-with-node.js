const mongoose = require('mongoose');

const manufacturerSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {
        type : String,
        required : true
    },
    field : {
        type : String
    },
    location : {
        type : String
    },
    Image : {
        type  :String
    }
});

module.exports = mongoose.model('Manufacturer',manufacturerSchema);