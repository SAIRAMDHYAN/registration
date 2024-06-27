// const jwt = require('jsonwebtoken');

// const isLoggedIn = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//     if (!token) {
//         return res.status(401).json({ error: 'No token provided, authorization denied' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         res.status(401).json({ error: 'Token is not valid' });
//     }
// };

// module.exports = isLoggedIn;



//////////////////////
let jwt=require('jsonwebtoken')

let isLoggedIn=(req,res,next)=>{

    let token=req.cookies.token;

    if(token){
        res.json('Sucess')
  jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
    if(err) {res.json('Invalid token')}
    else{
        req.email=decoded.email
        next()
    }
 
  })
    }
    if(!token){
        res.json('The token was not available')
    }

}

module.exports=isLoggedIn
