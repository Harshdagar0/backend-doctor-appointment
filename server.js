import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connnectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import doctorRoute from './routes/doctorRoute.js';
//app config
const app = express();
const port = process.env.PORT || 4000
//middlewares
app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 
app.use(cors());
connnectDB();
connectCloudinary();
//api endpoint
app.use('/api/admin',adminRouter);
app.use('/api/user',userRouter);
app.use('/api/doctor',doctorRoute);


app.get('/',(req,res)=>{
    res.send("hogya");
})

app.listen(port,()=>{
    console.log(`hogya start ${port}`);
})

 