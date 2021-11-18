import mongoose from 'mongoose';

const patientSchema = mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    dob: { type: String, default: "" },
})

let patientModel = mongoose.model('patients', patientSchema);

export default patientModel;
