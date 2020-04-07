const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
//register routes
router.get('/',(req,res,next)=>{
    Product.find()
    .select('name price _id')
    .exec()
    .then((products)=>{
        const response ={
            count : products.length,
            productsArray : products.map(product =>{
                return {
                    name : product.name,
                    price : product.price,
                    _id: product._id,
                    request:{
                        type : 'GET',
                        url : 'http://localhost:3000/products/'+product._id
                    }
                }
            })
        }
        res.status(200).json(response);
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error : error
        })
    })
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id')
    .exec()
    .then((product)=>{
        if(product){
            res.status(200).json({
                product : product,
                request : 'Get',
                description : 'Get all products',
                url : 'http://localhost:3000/products/'
            });
        }else{
            res.status(404).json({
                message : 'no valid entry found for provided Id.'
            })
        }
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({error:error});
    });
});

router.post('/',(req,res,next)=>{
    const product = new Product({
        _id : mongoose.Types.ObjectId(),
        name : req.body.name,
        price : req.body.price
    });
    product.save().then((result)=>{
        console.log(result);
        res.status(201).json({
            message : 'Created product successfuly.',
            createdProduct : {
                name : result.name,
                price : result.price,
                _id : result._id,
                request :{
                    type : 'GET',
                    url : 'http://localhost:3000/products/'+result._id
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

router.patch('/:productId',(req,res,next)=>{
    const id = req.params.productId ; 
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value
    }
    Product.update({_id : id},{$set:updateOps})
    .exec()
    .then((result)=>{
        console.log(result);
        res.status(200).json({
            message : 'product updated',
            request : {
                type : 'Get',
                url : 'http://localhost:3000/products/'+id
            }
        });
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error : error
        });
    });
});

router.delete('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then((result)=>{
        res.status(200).json({
            message : 'product deleted.'
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

module.exports = router;