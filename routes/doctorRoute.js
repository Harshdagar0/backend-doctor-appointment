import express from 'express';
import { doctorLogin } from '../controllers/docotorControllers.js';



const doctorRoute = express.Router();


doctorRoute.post('/doctorLogin',doctorLogin);






export default doctorRoute;




