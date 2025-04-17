import express from 'express';
import { Appointment, doctorLogin, setCancelled, setComplete } from '../controllers/docotorControllers.js';



const doctorRoute = express.Router();


doctorRoute.post('/doctorLogin',doctorLogin);
doctorRoute.get('/appointment',Appointment);
doctorRoute.post('/setComplete',setComplete);
doctorRoute.post('/setCancelled',setCancelled);






export default doctorRoute;




