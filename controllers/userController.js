import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js'
import userModel from "../models/userModel.js";
import AppointmentModel from '../models/appointmentModel.js';
import Razorpay from 'razorpay';
import { v2 as cloudinary } from 'cloudinary'

// create user account 

const registerUser = async (req, res) => {

    try {
        const { email, name, password } = req.body;
        const isEmail = await userModel.findOne({ email: email });
        console.log(isEmail);
        if (isEmail) {
            res.json({ succes: false, message: `You have already account from ${email}` })
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const finalData = {
                name,
                email,
                password: hashPassword
            }
            const newUser = await userModel(finalData);
            const user = await newUser.save();
            console.log(user);

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

            res.json({ succes: true, token, message: 'Account created successfully' })


        }


    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during creating account" })

    }
};


// user login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ email: email });
        if (user) {
            const comparePassword = await bcrypt.compare(password, user.password);
            if (comparePassword) {
                const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
                res.json({ succes: true, message: 'Succesfully Login', token })

            } else {

                res.json({ succes: false, message: 'Incorrect Password! Try again!!' })
            }

        } else {
            res.json({ succes: false, message: 'Invalid Email' })
        }

    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during login" })

    }
}

// get user profile
const getProfile = async (req, res) => {
    const { id } = req.body;
    try {
        const user = await userModel.findById(id).select('-password');
        res.json({ succes: true, user });

    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during get user data" })
    }
};

// update user Profile

const updataProfile = async (req, res) => {
    const { name, phone, gender, dob, address } = await req.body;
    const imageFile = req.file;

    const { token } = req.headers;
    try {
        const { id } = await jwt.verify(token, process.env.JWT_SECRET);
        if (id) {
            await userModel.findByIdAndUpdate(id, { name, phone, dob, gender, address: JSON.parse(address) })

            if (imageFile) {
            const    imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
                const imageUrl = imageUpload.secure_url;
                await userModel.findByIdAndUpdate(id, { image: imageUrl });
            }
            res.json({ succes: true, message: `${name} your profile update successfully` })

        } else {
            res.json({ succes: false, message: "Please login again!!" })
        }


    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during update your profile" })

    }

};

//Api for book appointment  

const bookAppointment = async (req, res) => {
    const { docId, sloteTime, sloteDate } = req.body;
    const { token } = req.headers;

    try {
        const { id } = await jwt.verify(token, process.env.JWT_SECRET);
        const userData = await userModel.findById(id).select('-password');
        const docData = await doctorModel.findById(docId).select('-password');

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not Available' });
        }

        let slots_booked = docData.slots_booked;

        if (slots_booked[sloteDate]) {
            if (slots_booked[sloteDate].includes(sloteTime)) {
                return res.json({ success: false, message: 'Slot not Available' });
            } else {
                slots_booked[sloteDate].push(sloteTime);
            }
        } else {
            slots_booked[sloteDate] = [sloteTime];
        }

        console.log(slots_booked);
        await delete docData.slots_booked;

        const appointmentData = {
            userId: id,
            docId,
            userData,
            docData,
            sloteDate,
            sloteTime,
            amount: docData.fees,
            date: Date.now()
        };

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        const add = new AppointmentModel(appointmentData);
        await add.save();

        return res.json({ success: true, message: 'Appointment Booked Successfully' });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Some Error during booking of appointment" });
    }
};

// get appiontment data

const getAppointment = async (req, res) => {
    const userId = req.body.id;
    try {
        const allApointment = await AppointmentModel.find({ userId });
        // console.log(allApointment);
        if (allApointment) {
            res.json({ succes: true, allApointment });
        } else {
            res.json({ succes: false, message: 'No Appointment' })
        }

    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during get user data" })

    }
}

// for cancel the appointment

const cancelAppointment = async (req, res) => {
    const { AppId } = req.body;
    try {


        const appointment = await AppointmentModel.findById(AppId);
        await AppointmentModel.findByIdAndUpdate({ _id: AppId }, { cancelled: true });

        const { docId, sloteDate, sloteTime } = appointment;
        const docData = await doctorModel.findById(docId);
        let slots_booked = await docData.slots_booked;

        slots_booked[sloteDate] = slots_booked[sloteDate].filter(e => e !== sloteTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ succes: true, message: 'appointment Cancel Successfully' });


    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during cancel appointment" })

    }
};


//payment of appointment using razorpay

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})


const payment = async (req, res) => {
    try {
        const { appId } = req.body;

        const appiontment = await AppointmentModel.findById(appId);

        if (!appiontment || appiontment.cancelled) {
            return res.json({ succes: false, message: 'Appointment cancelled or not found ' })
        }
        // setting up options for razorpay order.
        const options = {
            amount: appiontment.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appiontment._id,
        };


        const order = await razorpayInstance.orders.create(options)
        res.json({ succes: true, order });

    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during payment" })

    }

}

// verifying payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
        console.log(orderInfo);
        if (orderInfo.status === 'paid') {
            await AppointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            res.json({ succes: true, message: 'Payment successfully' })
        } else {
            res.json({ succes: false, message: 'Payment failed' })

        }

    } catch (error) {
        console.log(error);
        res.json({ succes: false, message: "Some Error during verify payment" })

    }
}

export { registerUser, loginUser, getProfile, updataProfile, bookAppointment, getAppointment, cancelAppointment, payment, verifyPayment }