const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
//register routes
router.get('/',(req,res,next)=>{
    Product.find()
    .exec()
    .then((products)=>{
       // if(products.length >= 0){
            console.log(products);
            res.status(200).json(products);
       // }
        // else{
        //     res.status(404).json({
        //         message : 'no entries found'
        //     })
        // }
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
    .exec()
    .then((product)=>{
        if(product){
            res.status(200).json(product);
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
            message : 'handling POST requests to /products',
            createdProduct : product
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
        res.status(200).json(result);
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
        res.status(200).json(result);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error : err
        });
    });
});

module.exports = router;