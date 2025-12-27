const User=require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const user = require("../models/user")


const signup= async(req,res)=>{
      if (!req.body || !req.body.fullName || !req.body.email || !req.body.password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
    const {fullName,email,password}=req.body
  //  console.log(req.body.fullName)
    try {
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }

        const hashedPassword=await bcrypt.hash(password,10)


        const newUser=new User({
            fullName,
            email,
            password:hashedPassword
        })

        await newUser.save()

        const token=jwt.sign({
            userId:newUser._id
        },process.env.JWT_SECRET,
        {
            expiresIn:"1d"
        }
    )

    res.status(201).json({message:"User created Succesfully",token,
        user:{
            id:newUser._id,
            fullName:newUser.fullName,
            email:newUser.email
        }
    })



    } catch (error) {
         console.error("signup error:", error);
  res.status(500).json({ message: "Server error" });
        
    }
}

const login=async(req,res)=>{
    const {email,password}=req.body;
  //  console.log("login body",req.body)
    try {
        const user = await User.findOne({email})
     //   console.log(user)
        
        if(!user){
            return res.status(400).json({message:"Invalid credentials"})

        }
        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"})
        }


        const token=jwt.sign(
            {userId:user._id},process.env.JWT_SECRET,{expiresIn:"1d"}
        )

        res.cookie('token',token,{
            httpOnly: true,
            secure:process.env.NODE_ENV==='production',
            sameSite:"strict",
            maxAge:24*60*60*1000
        })

        res.status(200).json({message:"Login successful",token,
            user:{
                id:user._id,
                fullName:user.fullName,
                email:user.email
            }}
        )
    } catch (error) {
        console.log("Login error:",error)
        res.status(500).json({message:"Server error"})
    }
}



module.exports={
    signup,login
}