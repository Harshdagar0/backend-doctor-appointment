import express from 'express';
import { bookAppointment, cancelAppointment, getAppointment, getProfile, loginUser, payment, registerUser, updataProfile, verifyPayment}  from '../controllers/userController.js';
import authUser from '../middelwares/authUser.js';
import upload from '../middelwares/multer.js';


const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.post('/updateProfile',authUser,upload.single('image'),updataProfile);
userRouter.get('/getProfile',authUser,getProfile);
userRouter.post('/bookAppointment',bookAppointment);
userRouter.get('/getAppointment',authUser,getAppointment);
userRouter.patch('/cancelAppointment',authUser,cancelAppointment);
userRouter.post('/payment',authUser,payment);
userRouter.post('/verifyPayment',authUser,verifyPayment);


export default userRouter;