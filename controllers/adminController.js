import validator from 'validator';
import bycrypt from 'bcrypt';
import {v2 as cloudinary} from 'cloudinary'; 
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken'
import AppointmentModel from '../models/appointmentModel.js';


// Add Doctors
const addDoctor =async(req,res)=>{
    try {
        const{name,email,password,speciality,degree,experience,about,fees,line1,line2}= req.body;
        const imageFile =req.file;
        console.log({name,email,password,speciality,degree,experience,about,fees,line1,line2},imageFile,req.files,req.body);
        const checkEmail = await doctorModel.findOne({ email });
        console.log(checkEmail);

        if(checkEmail){
            return res.json({succes:false,message:"You already have a account from this email"})
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({succes:false,message:"Please enter a valid email"})
        };
        
        //validating strong passowrd
        if(password.lenght<8){
            return res.json({succes:false,message:"Please enter a strong password"})
        } 
        //hashing doctor passoword
        const salt = await bycrypt.genSalt(10);
        const hashPassoword = await bycrypt.hash(password,salt);

        //upload image to cloudinary
        const uploadImage = await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"});
        const imageUrl = uploadImage.secure_url;

        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashPassoword,
            speciality,
            degree,
            experience,
            about,
            fees,
            line1,
            line2,
            data:Date.now()
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();
        console.log(doctorData);

        res.json({succes:true,message:"Doctor Added Successfully"})
        

    } catch (error) {

        console.log(error);
        res.json({succes:false,message:error.message})
        
    }

};
 

//APPI FOR  AMDIN LOGIN
const adminLogin = async(req,res)=>{
    const {email,password}= req.body.credentials;
    try {
        if(email=== process.env.ADMIN_EMAIL && password=== process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({succes:true,token,message:"Successfully Login"});

        }else{
        res.json({succes:false,message:"Incorrect email or password"});

        }

        
    } catch (error) {
        console.log(error);
        res.json({succes:false,message:error.message})
    }
}


//Get All doctors data

const AllDoctor = async(req,res)=>{
    const allDoctor = await doctorModel.find({}).select('-password');

    try {        
        res.json({succes:true,data:allDoctor})
    } catch (error) {
        
        
        console.log(error); 
        res.json({succes:false,message:"Some Error to load data "})
    }



}

// appointment data

const getAppointment=async(req,res)=>{
    
   try {
    const data = await AppointmentModel.find({});
    if(data){
        res.json({succes:true,data})
    }else{
        res.json({succes:false,message:'Not getting Data'});
    }
    
   } catch (error) {
    res.json({succes:false,message:error.message});
    
   }
}



export  {addDoctor,adminLogin,AllDoctor,getAppointment}; 