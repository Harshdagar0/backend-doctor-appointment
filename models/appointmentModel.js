import mongoose, { model, Schema } from "mongoose";

const AppointmentSchema = new Schema({

    userId:{type:String,require:true},
    docId:{type:String,require:true},
    sloteDate:{type:String,require:true},
    sloteTime:{type:String,require:true},
    userData:{type:Object,require:true},
    docData:{type:Object,require:true},
    amount:{type:Number,require:true},
    date:{type:Number,require:true},
    cancelled:{type:Boolean,default:false},
    payment:{type:Boolean,default:false},
    isCompleted:{type:Boolean,default:false},

})

const AppointmentModel =  model('appointmen',AppointmentSchema);

 export default AppointmentModel;