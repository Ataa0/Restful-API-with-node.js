const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const Authenticate = require('../Authentication/check-Auth');
const textSearch = require('mongoose-text-search');
const Product = require('../models/product');
const Manufacturer = require('../models/manufacturer');
const User = require('../models/user');
const Comment = require('../models/comment');
//adjust how files get stored
const storage = multer.diskStorage({
    //multer will execute these functions whenever a new file is recieved
    destination : function(req,file,cb){
        console.log('here');
        //pass an error and the path to store the file
        cb(null,'D:/projects/Node.js/Building a REST API/uploads');
    },
    filename : function(req,file,cb){
        //pass an error and the file name
        cb(null, Date.now()+ file.originalname);
    }
});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/png'){
        //accept a file
        cb(null,true);
    }
    else{
        //reject a file
        console.log('the file type is not supported.')
        return cb(null,false);
    }   
}
const upload =multer({storage: storage,limits : {
    fileSize : 1024* 1024 *5
    },
    fileFilter : fileFilter
});
function lowerCase(array){
    array.forEach(product => {
        let productName = product.name;
        let productCategory = product.category;
        let productManufacturer = product.manufacturer.name;
        product.name = productName.toLowerCase();
        product.category = productCategory.toLowerCase();
        product.manufacturer.name = productManufacturer.toLowerCase();
        console.log(product.manufacturer)
    });
    //console.log(array)
    return array
}

//register routes
router.get('/',(req,res,next)=>{
    Product.find()
    //.populate('manufacturer comment')
    .populate({path :'comments.comment', model : 'Comment',
        populate : {path:'comment.author',model : 'User'}})
    .then((products)=>{
        const response ={
            count : products.length,
            productsArray : products
        }
        res.status(200).json(response);
        
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error : error
        });
    })
});

router.get('/search/',(req,res,next)=>{
    Product.find({})
    .then((products)=>{
        let paramCount = Object.keys(req.query).length;
        let searchResult = [];
        products = lowerCase(products);
        if(paramCount==1){
            let searchWord = req.query.q;
            searchWord = searchWord.toLowerCase();
            products.forEach(product => {
                let productName = product.name;
                let productCategory = product.category;
                let productManufacturer = product.manufacturer.name;
                if(productName.includes(searchWord) || productCategory.includes(searchWord) || productManufacturer.includes(searchWord)){
                    console.log(product)
                    searchResult.push(product);
                }
            });
            res.status(200).json({
                count : searchResult.length,
                result : searchResult
            });
        }
        else if (paramCount>1){
            searchResult = products;
            if(req.query.manufacturer){
                console.log('manufacturer');
                let man =req.query.manufacturer.toLowerCase();
                searchResult = searchResult.filter(product=>product.manufacturer.name.includes(man))
            }
            if(req.query.name){
                console.log('name')
                searchResult = searchResult.filter((product)=>product.name.includes(req.query.name))
            }
            if(req.query.category){
                console.log('cat')
                searchResult = searchResult.filter((product)=>product.category.includes(req.query.category))
            }

            res.status(200).json({
                count : searchResult.length,
                result : searchResult
            });
        }
    }).catch((error)=>{console.log(error);
        res.status(500).json({
            error : error
        })
    });
});

router.post('/',Authenticate.checkUser,Authenticate.checkIfAdmin,upload.single('productImage'),(req,res,next)=>{//added middleware to handle the request before the callback
    Manufacturer.findById(req.body.manufacturer)
    .then((value)=>{
        if(value){
            console.log('body = ',req.body);
            let product = new Product(req.body);
            product._id = mongoose.Types.ObjectId();
            if(!req.file){
                res.status(500).json({
                    message : 'product Image not found or the file type is not supported.'
                });
            }
            product.productImage = req.file.path;
            product.save().then((result)=>{
                console.log(result);
                res.status(201).json({
                    message : 'Created product successfuly.',
                    createdProduct : product
                });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error:err
            })
        });
    }
        else{
            res.status(404).json({
                message : 'manufacturer not found.'
            });
        }
    })
    .catch((error)=>{
        console.log(error)
        res.status(500).json({
                error:error
            })
    })
});
router.delete('/',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
    Product.remove({})
    .then((result)=>{
        res.status(200).json({
            result : result,
            message : 'products deleted'
        })
    }).catch((err)=>next(err));
})

router.get('/:productId',(req,res,next)=>{
    console.log('b/')
    const id = req.params.productId;
    Product.findById(id)
    .populate({path :'comments.comment', model : 'Comment',
        populate : {path:'comment.author',model : 'User'}})
    .then((product)=>{
        if(product){
            res.status(200).json({
                product : product
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

    

router.patch('/:productId',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
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

router.delete('/:productId',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
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


router.post('/:productId/comments',Authenticate.checkUser,(req,res,next)=>{
    Product.findById(req.params.productId)
    .then((product)=>{
        if(!product){
            return res.status(404).json({
                message : 'the requested product was not found.'
            });
        }
        let text = req.body.text;
        let author = req.userData._id;
        let comment = new Comment({
            text : req.body.text,
            author : author,
            _id : mongoose.Types.ObjectId()
        });
        console.log(comment);
        product.comments.push(comment);
        product.save()
        .then((result)=>{
                console.log(comment);
                console.log(product);
                res.status(200).json({
                message : 'comment added.',
                result : result
            });
        })
        .catch((error)=>{
            console.log(error);
            next(error);
        });
    })
    .catch((error)=>{
        console.log(error);
        next(error);
    });
});

router.delete('/:productId/comments/:commentId',Authenticate.checkUser,(req,res,next)=>{
    Product.findById(req.params.productId)
    .then((product)=>{
        if(!product){
            res.status(404).json({
                message : 'manufacturer not found.'
            });
        }
        else{
            let check = false;
            product.comments.forEach(comment => {
                console.log(comment.author._id);
                console.log(req.userData._id);
                if(comment.author._id==req.userData._id){
                    check = true;
                    console.log(comment._id)
                    comment.remove()
                    product.save()
                    .then((result)=>{
                            console.log(product.comments);
                            res.status(200).json({
                            message : 'comment deleted.'
                        });
                    });
                }
            });
            if(!check){
                res.status(401).json({
                    message : 'you are not authorized to deleted this comment'
                });
            }
        }
    }).catch((error)=>{
        console.log(error);
        next(error);
    });
});




module.exports = router;