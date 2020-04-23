const JWT = require('jsonwebtoken');
module.exports.checkUser= (req,res,next)=>{
    try{
        console.log('user')
        let token = req.headers.authorization;
        token = token.split(" ")[1];
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

module.exports.checkIfAdmin= (req,res,next)=>{
    console.log('admin')
    console.log(req.userData)
    if(req.userData.isAdmin){
        next();
    }
    else{
        return res.status(401).json({
            message : 'Unauthorized. The user is not an admin'
        });
    }
}

