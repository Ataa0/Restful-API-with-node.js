const express = require('express');
const morgan  =require('morgan');
const app = express();


const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');


app.use(morgan('dev'));//handles the next function


//setting up middleware with app.use()
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);

//Error handling
// if I get to this route, that means that no other router was able to handle this request.
app.use((req,res,next)=>{
    const error = new Error('Not found');
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