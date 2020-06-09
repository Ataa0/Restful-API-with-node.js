const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const Authenticate = require('../Authentication/check-Auth');
const Basket = require('../models/basket');
const multer = require('multer');
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
    if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/png' || file.mimetype ==='text/json'){
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

//the admin has the privilage to retrieve all the users
Router.get('/',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
    User.find()
    .then((users)=>{
        if(users.length>0){
            res.status(200).json({
                count : users.length,
                users : users
            })
        }
        else{
            res.status(404).json({
                count : users.length,
                users : users
            })
        }
    })
    .catch((error=>{
        console.log(error);
        next(error);
    }))
});

Router.get('/profile',Authenticate.checkUser,(req,res,next)=>{
    User.findById({_id : req.userData._id})
    //.populate('addresses')
    .then((user)=>{
        console.log(user);
        res.status(200).json({
            user : user
        });
    }).catch((error)=>next(error));
});
Router.post('/signup',(req,res,next)=>{
    User.find({email : req.body.email})
    .exec()
    .then(user=>{
        if(user.length>=1){
            return res.status(422).json({
                message : 'email is not available'
            });
        }else{
            bcrypt.hash(req.body.password,10,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error : err
                    });
                }
                else{
                    var basket = new Basket();
                    const user = new User(req.body);
                    user._id = mongoose.Types.ObjectId();
                    email = req.body.email;
                    user.password = hash;
                    user.basket = basket;
                    user.save()
                    .then(result=>{
                        console.log(result);
                        res.status(200).json({
                            message : 'user created',
                            user : user
                        })
                    })
                    .catch(err =>{
                        console.log(err);
                        res.status(500).json({
                            error : err
                        })
                    })
                }
            });
        }
    });
});

Router.post('/login',(req,res,next)=>{
    User.find({email : req.body.email})
    .exec()
    .then(user =>{
        if(user.length<1){
            //the following is not a very safe way
            // res.status(404).json({
            //     message : 'Email not found, user doesn\'t exist'
            // });
            return res.status(401).json({
                message : 'Authentication failed'
            })
        }else{
            bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
                if(err){
                    console.log('pass')
                    return res.status(401).json({
                        message : 'Authentication failed'
                    })
                }
                if(result){
                    console.log(process.env.JWT_Key)
                    const Token = JWT.sign({
                        _id : user[0]._id,
                        email : user[0].email,
                        password : user[0].password,
                        isAdmin : user[0].isAdmin,
                        basket : user[0].basket
                    },
                    process.env.JWT_Key,
                    {
                        expiresIn : "24h"
                    })
                    return res.status(200).json({
                        message : 'Authentication Successful',
                        isAdmin : user[0].isAdmin,
                        token : Token
                    });
                }
                return res.status(401).json({
                    message : 'Authentication failed'
                })
            });
        }
    })
    .catch((err)=>{
        res.status(500).json({
            error : err
        })
    })
}); 
//Add profile photo
Router.post('/profilephoto',Authenticate.checkUser,upload.single("profileImage"),(req,res,next)=>{
    User.findById({_id : req.userData._id})
    .then((user)=>{
        user.images.push(req.file.path);
        user.save()
        res.status(200).json({
            message : 'profile picture updated successfully.',
            user : user
        });
    }).catch((error)=>{
        console.log(error);
        next(error);
    })
});
//update profile
Router.post('/profile',Authenticate.checkUser,(req,res,next)=>{
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value
    }
    User.findByIdAndUpdate({_id : req.userData._id},{update : updateOps})
    .then((user)=>{
        res.status(200).json({
            message : 'profile updated successfully',
            user:user
        });
    }).catch((error)=>{
        next(error);
    })
});
//Add an address
Router.post('/profile/address',Authenticate.checkUser,(req,res,next)=>{
    User.findById({_id : req.userData._id})
    .then((user)=>{
        user.addresses.push(req.body);
        user.save()
        .then((userUpdated)=>{
            res.status(200).json({
                message : 'address added successfully.',
                user : user
            });
        }).catch((error)=>next(error));
    }).catch((error)=>next(error));
});

//delete an address
Router.delete('/profile/address/:id',Authenticate.checkUser,(req,res,next)=>{
    User.findById({_id : req.userData._id})
    .then((user)=>{
        var id = mongoose.Types.ObjectId(req.params.id);
        if(user.addresses.some((address)=>address._id==id.toString())){
            var index = user.addresses.findIndex((address)=>address._id==id.toString());
            user.addresses.splice(index,1);
            user.save()
            .then((result)=>{
                res.status(200).json({
                    message : 'address deleted successfully',
                    user : user
                })
            }).catch((error)=>next(error));
        }
        else{res.status(404).json({
            message : 'this address does not exist',
        })}
    }).catch((error)=>next(error));
});
Router.delete('/:userid',(req,res,next)=>{
    User.find({_id : req.params.userid}).exec()
    .then(user=>{
        if(user.length>=1){
            User.remove({_id : user[0]._id})
            .exec()
            .then((result)=>{
                console.log(result);
                res.status(200).json({
                    message : 'user deleted'
                });
            })
            .catch((Err)=>{
                res.status(500).json({
                    error : Err
                })
            })
        }else{
            res.status(404).json({
                message : 'user not found'
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            err : err
        })
    });

    
});

Router.get('/orders',Authenticate.checkUser,(req,res,next)=>{
    User.findById({_id : req.userData._id})
    .populate({
        path : 'orders',
        model : 'Order',
        select : '_id netTotal',
        populate: {path : 'productList.product',select :'_id quantity'}
    })
    .exec()
    .then((user)=>{
        console.log('user : ',user)
        console.log(user.orders.length)
        res.status(200).json({
            count : user.orders.length,
            user : user
        });
    })
    .catch((err)=>next(err));
});

Router.get('/orders/:orderId',Authenticate.checkUser,(req,res,next)=>{
    User.findById({_id : req.userData._id})
    .populate({
        path : 'orders',
        select : '_id netTotal',
        populate:{path : 'productList.product',select :'_id quantity'}
    })
    //.populate('orders.order')
    .then((user)=>{
        let check = false;
        if(user._id != req.userData._id){
            res.status(403).json({
                message : 'You are unauthorized to view this data'
            });
        }else{
            user.orders.forEach(order => {
                if(order._id == req.params.orderId){
                    check = true
                    res.status(200).json({
                        order : order
                    });
                }
            });
        }if(!check){
        res.status(404).json({
            message : 'the requested order was not found'
        });}
    })
});

module.exports = Router;