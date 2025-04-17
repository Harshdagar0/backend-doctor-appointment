import AppointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

//toggel between available or not available
const doctorAvailable = async (req, res) => {

    try {
        const { docId } = req.body;
        console.log(req.body);

        const doctor = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, { available: !doctor.available });
        await res.json({ succes: true, message: ` ${doctor.name} availablity set to ${!doctor.available ? 'Available' : 'not Available'}` })

    } catch (error) {

        console.log(error);
        res.json({ succes: false, message: "Some Error to Update available " })

    }


}
//login doctor

const doctorLogin = async (req, res) => {
    const { email, password } = req.body.credentials;
    try {
        const doc = await doctorModel.findOne({ email });
        if (doc) {
            const compareHashPassowrd = await bcrypt.compare(password, doc.password);
            if (compareHashPassowrd) {
                const dToken = jwt.sign({ email: doc.email }, process.env.JWT_SECRET);
                res.json({ succes: true, message: 'Login Successfully', dToken });
            } else {
                res.json({succes:false,message:'Incorrect Password'});
            }
        } else {
            res.json({ succes: false, message: 'Invalid email !! Please Check again!' })
        }
    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: error.message });
    }
}

// appointment

const Appointment = async(req,res)=>{
    const {dtoken} = req.headers;
    try {
        if(dtoken){
            const {email} = jwt.verify(dtoken,process.env.JWT_SECRET);
            if(email){
              const doc =  await doctorModel.findOne({email});
              const allAppointment = await AppointmentModel.find({docId : doc._id});
              res.json({succes:true,allAppointment});               
            }else{
                res.json({succes:false,message:"doctor not found"})
            }
        }else{
            res.json({succes:false,message:"Not Authorizes Login again"})
        }
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:error.message});       
    }
}


// set complete to appointment

const setComplete=async(req,res)=>{
    const {appId} = req.body;
    const {dtoken} = req.headers;

    try {
        if(dtoken){
            const {email} = jwt.verify(dtoken,process.env.JWT_SECRET);
            if(email){
              const Appointment = await AppointmentModel.findById(appId);
              if(Appointment){
                await AppointmentModel.findByIdAndUpdate(appId,{isCompleted:true,payment:true});
                res.json({succes:true,message:'Appointment Completed successfully'});               
            }
            }else{
                res.json({succes:false,message:"appointment not found please recheck !!"})
            }
        }else{
            res.json({succes:false,message:"Not Authorizes Login again"})
        }

        
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:error.message});             
    }
}

const setCancelled=async(req,res)=>{
    const {appId} =  req.body;
    const {dtoken} = req.headers;

    try {
        if(dtoken){
            const {email} = jwt.verify(dtoken,process.env.JWT_SECRET);
            if(email){
              const Appointment = await AppointmentModel.findById(appId);
              if(Appointment){
                await AppointmentModel.findByIdAndUpdate(appId,{cancelled:true});
                res.json({succes:true,message:'Appointment Cancelled successfully'});               
            }
            }else{
                res.json({succes:false,message:"appointment not found please recheck !!"})
            }
        }else{
            res.json({succes:false,message:"Not Authorizes Login again"})
        }

        
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:error.message});             
    }
}


export { doctorAvailable, doctorLogin,Appointment,setComplete,setCancelled};