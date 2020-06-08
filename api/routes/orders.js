const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const Basket = require('../models/basket');
const Authenticate = require('../Authentication/check-Auth');

router.get('/',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
    Order.find()
    .populate({path : 'productList.product',select :'_id quantity'})
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
//order now
router.post('/',Authenticate.checkUser,(req,res,next)=>{   
    Product.findById(req.body.product.product)
    .then(product=>{
        if(!product){
            res.status(404).json({
                message : 'product was not found'
            });
        }else{
            if(Number.parseInt(product.quantity) <Number.parseInt(req.body.quantity) ){
                return res.status(412).json({
                    message : 'there is not enough of the product in stock'
                });
            }
            let orderQuantity  = req.body.quantity;
            product.quantity -=orderQuantity;
            product.save()
            .then((prod)=>{
                const order = new Order({
                    _id : mongoose.Types.ObjectId(),
                    quantity : req.body.quantity,
                    user : req.userData._id
                });
                order.productList.push({"product":product,"quantity":orderQuantity})
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

router.post('/basket',Authenticate.checkUser,(req,res,next)=>{
    //getting the product IDs from the basket.
    User.findById({_id : req.userData._id})
    .then((user)=>{
        var basket = user.basket;
        console.log(basket.quantity)
        if(basket.quantity==0)
            {
                res.status(404).json({
                    message : "the user's basket is empty."
                })
            }
        else{
            var productsFromBasket = basket.itemList;
            var productIdsFromBasket = [];
            productsFromBasket.forEach(productFB => {
                productIdsFromBasket.push(new mongoose.Types.ObjectId(productFB.product));
            });
            //getting the products that are in the basket.
            Product.find({'_id' : {$in : productIdsFromBasket}})
            .then((products)=>{
                //constructing a new Order
                let order = new Order();
                let orderQuantity = basket.quantity;
                let netTotal = basket.totalPrice;
                order.quantity = orderQuantity;
                order.netTotal = netTotal;
                order.productList = productsFromBasket;
                console.log('order : ',order.productList);
                console.log('basket : ',productsFromBasket);
                order.user = req.userData;
                order._id = mongoose.Types.ObjectId();
                var counter =0;
                //saving the order in the database
                order.save()
                .then((result=>{
                    console.log('after saving')
                    var promise = new Promise((resolve,reject)=>{
                        //changing the quantity of the products
                        products.forEach(product => {
                            product.quantity-=productsFromBasket[counter++].quantity;
                            product.save()
                            resolve()
                        });
                    })
                    //saving the products
                    promise.then((saveresult)=>{
                        //adding the order to the user's orders and emptying the user's basket
                        user.orders.push(order);
                        user.basket = new Basket();
                        //saving the user.
                        user.save()
                        .then((userSaved)=>{
                            res.status(200).json({
                                message : 'order submitted successfully.',
                                order : order
                            });
                        }).catch((error)=>{console.log(error)})
                    }).catch((error)=>console.log(error));
                })).catch(error=>console.log(error))
            }).catch(error=>next(error));
        }
    }).catch((error)=>console.log(error))            
})
           
        
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