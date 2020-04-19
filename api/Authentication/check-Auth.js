const JWT = require('jsonwebtoken');
module.exports= (req,res,next)=>{
    try{
        let token = req.headers.authorization;
        token = token.split(" ")[1];
        console.log('token = ',token);
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