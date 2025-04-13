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

export { doctorAvailable, doctorLogin };