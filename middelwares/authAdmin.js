import jwt from 'jsonwebtoken';


//admin authentication middelware


const authAdmin = async(req,res,next)=>{
    try {
        const {atoken} = req.headers;
        if(!atoken){
            return   res.json({succes:false,message:"Not Authorizes Login again"})
        }
        const token_decode = jwt.verify(atoken,process.env.JWT_SECRET)
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return  res.json({succes:false,message:"Wrong token Login again"})

        }
        next()

        
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:error.message})
    }

}

export default authAdmin;