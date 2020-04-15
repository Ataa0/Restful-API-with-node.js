const express = require('express');
const morgan  =require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();


const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/users');

//connect to mongodb
const url = 'mongodb://localhost:27017/Shop';
mongoose.connect(url);

app.use(morgan('dev'));//handles the next function
app.use('/uploads',express.static('uploads'));//make the uploads folder static
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// funnel every request with it, adds this header to all the responses
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    //define which kind of headers we want to accept, '*' means anything
    res.header('Access-Control-Allow-Headers','Origin , X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();// passing the request to the other routes
});


//setting up middleware with app.use()
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/users',userRoutes);


//Error handling
// if I get to this route, that means that no other router was able to handle this request.
app.use((req,res,next)=>{
    const error = new Error('the requested router was not found');
    error.statusCode=404;
    next(error);
});

//the error handler, handles errors from all over the application
app.use((error,req,res,next)=>{
    console.log('inside the global error handler');
    res.status(error.status || 500)
    res.json({
        error: {
            message : error.message
        }
    });
});
module.exports = app;