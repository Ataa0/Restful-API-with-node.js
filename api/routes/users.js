const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');


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
                    const user = new User({
                        _id : mongoose.Types.ObjectId(),
                        email : req.body.email,
                        password : hash
                    });
                    user.save()
                    .then(result=>{
                        console.log(result);
                        res.status(200).json({
                            message : 'user created'
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
Router.get('/signin',(req,res,next)=>{

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

    
})
module.exports = Router;