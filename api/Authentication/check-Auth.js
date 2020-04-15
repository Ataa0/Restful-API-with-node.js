const JWT = require('jsonwebtoken');


module.exports= (req,res,next)=>{
    try{
        const token = req.headers.authorization;
        const decodedToken = JWT.verify(token,process.env.JWT_Key);
       // if(decodedToken){
            req.userData = decodedToken;
            next();
        //}
    } catch(error){
        console.log(error);
        return res.status(401).json({
            message : 'Authentication failed.'
        });
    }
}