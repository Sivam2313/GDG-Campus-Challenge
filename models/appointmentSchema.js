import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  startTime: {
    type: String, 
    required: true,
  },
  endTime: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    enum: ['BOOKED', 'FREE', 'COMPLETED'],
    default: 'FREE',
  },
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
