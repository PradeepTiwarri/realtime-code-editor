const jwt=require("jsonwebtoken")

const verifyToken=(req,res,next)=>{
    const authHeader=req.headers.authorization;

if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"Unauthorized user...Login again"})
}

const token = authHeader.split(" ")[1]

try {
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    req.userId=decoded.userId
} catch (error) {
    res.status(401).json({message:"Unauthorized...Login again"})
    
}

}

module.exports=verifyToken