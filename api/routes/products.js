const express = require('express');
const router = express.Router();


//register routes
router.get('/',(req,res,next)=>{
    res.status(200).json({
        message : 'handling GET requests to /products'
    });
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    if(id === 'special'){
        res.status(200).json({
            message : 'you have discovered the special id',
            id : id
        });
    }
    else{
        res.status(200).json({
            message : 'you passed an Id'
        });
    }
});

router.post('/',(req,res,next)=>{
    res.status(201).json({
        message : 'handling POST requests to /products'
    });
});

router.patch('/:productId',(req,res,next)=>{
    res.status(200).json({
        message : 'updated product'
    });
});

router.delete('/:productId',(req,res,next)=>{
    res.status(200).json({
        message : 'deleted product'
    });
});

module.exports = router;