const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const Authentication = require('../Authentication/check-Auth');

router.get('/',Authentication,(req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product','name')
    .exec()
    .then(orders=>{
        res.status(200).json({
            count : orders.length,
            orders : orders.map(order=>{
                return {
                    _id : order._id,
                    product : order.product,
                    quantity : order.quantity
                }
            })
        })
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        });
    });
});

router.get('/:orderId',Authentication,(req,res,next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then((order)=>{
        if(!order){
            res.status(404).json({
                message : 'order was not found.'
            });
        }else{
            res.status(200).json({
                order : {
                    _id : order._id,
                    quantity : order.quantity,
                    product : order.product
                }
            });
        }
    })
    .catch((err)=>{
        error : err
    })
});

router.post('/',Authentication,(req,res,next)=>{
    Product.findById(req.body.productId)
    .then(product=>{
        if(!product){
            res.status(404).json({
                message : 'product was not found'
            });
        }else{
        const order = new Order({
            _id : mongoose.Types.ObjectId(),
            quantity : req.body.quantity,
            product : req.body.productId
        });
        return order.save();
    }
    })
    .then((result)=>{
        console.log(result);
        res.status(201).json({
            createdOrder : {
                _id : result._id,
                product : result.product,
                quantity : result.quantity
            }
        });
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

router.delete('/:orderId',Authentication,(req,res,next)=>{
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