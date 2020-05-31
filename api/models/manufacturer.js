const mongoose = require('mongoose');

const manufacturerSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {
        type : String,
        required : true
    },
    fields : [{
        type : String
    }],
    locations : [{
        type : String
    }],
    images : [{
        type  :String
    }]
});

module.exports = mongoose.model('Manufacturer',manufacturerSchema);