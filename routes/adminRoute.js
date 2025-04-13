import express from 'express';
import { addDoctor, adminLogin, AllDoctor, getAppointment } from '../controllers/adminController.js';
import upload from '../middelwares/multer.js';
import authAdmin from '../middelwares/authAdmin.js';
import { doctorAvailable } from '../controllers/docotorControllers.js';


const adminRouter = express.Router()

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',adminLogin)
adminRouter.get('/alldoctor',authAdmin,AllDoctor)
adminRouter.get('/doctor',AllDoctor)
adminRouter.patch('/changeAvailable',doctorAvailable)
adminRouter.get('/getAppointment',authAdmin,getAppointment);

export  default adminRouter;