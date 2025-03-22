import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  description: { type: String, required: true  },
  medicalHistory: [{
    condition: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  }],
  allergies: [{ type: String }],
  medications: [{
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String },
  }],
  ticketSubscribers:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ngo'
  }],
  appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
