import jwt from 'jsonwebtoken';

const authUser=(req,res,next)=>{
    const {token} = req.headers;
    try {
        if(token){

            const  {id} = jwt.verify(token,process.env.JWT_SECRET);
            if(id){
                req.body.id = id;
            }else{
                return  res.json({succes:false,message:"Wrong token Login again"})
            }
        }else{
            return  res.json({succes:false,message:"Not Authorizes Login again"})
        }
        
    } catch (error) {
        console.log(error)
        
    }
    next();
}


export default authUser;