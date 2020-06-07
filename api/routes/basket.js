const mongoose = require('mongoose');
const product = require('../models/product');
const express = require('express');
const Router = express.Router();
const Authenticate = require('../Authentication/check-Auth');
const User = require('../models/user');
const Product = require('../models/product');
const Basket = require('../models/basket');
Router.get('/',Authenticate.checkUser,(req,res,next)=>{
    User.findById({_id : req.userData._id})
    .then((user)=>{
        if(!user){
            res.status(404).json({
                message : "user not found"
            });
        }
        else{
            res.status(200).json({
                basket : user.basket
            });
        }
    })
    .catch((error)=>next(error));
});

//Add product to basket
Router.post('/',Authenticate.checkUser,(req,res,next)=>{//needs to check if th eproduct already exists in the basket, update the quantity.
    User.findById({_id : req.userData._id})
    .then((user)=>{
        if(!user){
            res.status(404).json({
                message : "user not found"
            });
        }
        else{
            //extract the ids of the products from the list in the request body
            var items = req.body.itemList;
            var array = [];
            items.forEach(item => {
                array.push(new mongoose.Types.ObjectId(item.product));
            });

            //find the products that match the id to get the individual prices  and check for sufficient quantity.
            Product.find({'_id': { $in: array}},(err,products)=>{
                var boolean = false;
                counter =0;
                products.forEach(product => {
                    //the price of all units of a single product
                    let item =items.find(function(element) {
                        return element.product ==product._id;
                    });
                    if(product.quantity<item.quantity)
                        {
                            boolean = true;
                            return res.status(412).json({
                                message : 'There are not enough items to fullfill your order',
                                quantity : product.quantity
                            });
                        }
                        else if(!boolean){
                            //calculate the price of all product units combined
                            var itemListPrice = item.quantity*product.price;
                            //calculate the total price of all items in the basket
                            user.basket.totalPrice+=itemListPrice;
                            //calculate the total quantity of all items in the basket
                            user.basket.quantity+=item.quantity;
                            var dummy = user.basket.itemList;
                            var ID = product._id;
                            //a function to check if the product exists in the basket
                            var existingProduct = dummy.find(function(pp){
                                var dummyString=pp.product;
                                dummyString=dummyString.toString();
                                ID = ID.toString();
                                return dummyString==ID;
                            })
                            //check if the product already exists in the basket, find its index and increase the quantity
                            if(existingProduct){
                                console.log(dummy);
                                console.log(existingProduct._id);
                                var existingProductIndex = user.basket.itemList.findIndex((productd =>productd._id ==existingProduct._id));
                                user.basket.itemList[existingProductIndex].quantity+=item.quantity;
                            }else{//else add a new entry to the basket.
                                user.basket.itemList.push(item);
                            }
                        }
                });
                user.save()
                .then((result)=>{
                    res.status(200).json({
                        message : 'basket updated successfully.',
                        basket : user.basket
                    });
                }).catch(error=>console.log(error))
            });
        }
    })
});

Router.delete('/:userId',(req,res,next)=>{
    User.findById({_id : req.params.userId})
    .then((user)=>{
        if(!user){
            res.status(404).json({
                message : "user not found"
            });
        }
        else{
            user.basket = new Basket();
            user.save()
            .then((result)=>{
                console.log(result);
                res.status(200).json({
                    message : 'basket reset successful.',
                    basket : user.basket
                });
            })
        }

    })
})
module.exports = Router;