const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Authenticate = require('../Authentication/check-Auth');

router.get('/',Authenticate.checkUser,(req,res,next)=>{
    Order.find()
    .populate('product')
    .populate({path : 'user',select : '_id email'})
    .exec()
    .then(orders=>{
        res.status(200).json({
            count : orders.length,
            orders : orders
        })
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });
});

router.post('/',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
    Product.findById(req.body.productId)
    .then(product=>{
        if(!product){
            res.status(404).json({
                message : 'product was not found'
            });
        }else{
            if(Number.parseInt(product.quantity) <Number.parseInt(req.body.quantity) ){
                return res.status(412).json({
                    message : 'there is not enough of th product in stock'
                });
            }
            let orderQuantity  = req.body.quantity;
            product.quantity -=orderQuantity;
            product.save()
            .then((prod)=>{
                const order = new Order({
                    _id : mongoose.Types.ObjectId(),
                    quantity : req.body.quantity,
                    product : req.body.productId,
                    user : req.userData._id
                })
                order.save()
                .then((order)=>{
                    User.findByIdAndUpdate({_id : req.userData._id},{"$addToSet":{"orders":order}})
                    .then((something)=>{
                        res.status(201).json({
                            createdOrder : order
                        });
                    })
                    .catch(err=>{
                        console.log(err)
                        next(err);
                    });
        }).catch(err=>console.log(err))
            }).catch(err=>{console.log(err)});
    }
})
    .catch((err)=>{
        console.log(err)
        res.status(500).json({
            error : err
        });
    });
});


router.get('/:orderId',Authenticate.checkUser,(req,res,next)=>{

    Order.findById(req.params.orderId)
    .populate('product')
    .populate({path : 'user',select : '_id email'})
    .then((order)=>{
        if(!order){
            res.status(404).json({
                message : 'order was not found.'
            });
        }else{
            res.status(200).json({
                order : order
            });
        }
    })
    .catch((err)=>
    {
        console.log(err)
        res.status(500).json({
            error : err
        });
    })
});


router.delete('/:orderId',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
    console.log('Delete')
    Order.remove({_id : req.params.orderId})
    .exec()
    .then((result)=>{
        res.status(200).json({
            message : 'order deleted.'
        });
    })
    .catch((err)=>{
        error : err
    });
});



module.exports = router;