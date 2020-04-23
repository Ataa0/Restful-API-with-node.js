const express = require('express');
const Router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const Manufacturer = require('../models/manufacturer');
const Authenticate = require('../Authentication/check-Auth');

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


//get all manufacturers
Router.get('/',(req,res,next)=>{
    Manufacturer.find({})
    .then((Manufacturers)=>{
        res.status(200).json({
            count : Manufacturers.length,
            Manufacturers : Manufacturers
        });
    })
    .catch((error)=>{
        next(error);
    });
});

Router.post('/',Authenticate.checkUser,Authenticate.checkIfAdmin,upload.single('Image'),(req,res,next)=>{
    let manufacturer = new Manufacturer(req.body);
    manufacturer._id = mongoose.Types.ObjectId();
    console.log(manufacturer);
    manufacturer.Image = req.file.Image;
    manufacturer.save().then((result)=>{
        res.status(200).json({
            message : 'manufacturer created',
            manufacturer : manufacturer
        });
    })
    .catch((error)=>{
        console.log(error);
        next(error);
    });
});


Router.get('/:manufacturerId',(req,res,next)=>{
    Manufacturer.findbyId({_id : req.params.manufacturerId})
    .then((Manufacturer)=>{
        res.status(200).json({
            Manufacturer : Manufacturer
        });
    })
    .catch((error)=>{
        next(error);
    });
});

Router.patch('/:manufacturerId',Authenticate.checkUser,Authenticate.checkIfAdmin,upload.single('Image'),(req,res,next)=>{
    const id = req.params.manufacturerId ; 
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    console.log(updateOps)
    Manufacturer.update({_id : id},{$set:updateOps})
    .exec()
    .then((result)=>{
        res.status(200).json({
            message : 'Manufacturer updated',
        });
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error : error
        });
    });
});

Router.delete('/:manufacturerId',Authenticate.checkUser,Authenticate.checkIfAdmin,(req,res,next)=>{
    Manufacturer.findByIdAndRemove({_id:req.params.manufacturerId})
    .then((result)=>{
        if(!result){
            return res.status(404).json({
                message : 'manufacturer not found'
            });
        }
        res.status(200).json({
            message : 'manufacturer with id : '+req.params.manufacturerId+' deleted.'
        });
    })
    .catch((error)=>{
        next(error);
    });
})
module.exports = Router;