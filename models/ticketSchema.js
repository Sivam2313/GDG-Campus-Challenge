import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
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
  type:{
    type: String,
    required: true,
    enum: ['Medicine Supply', 'Medical Tests', 'Request for a Specialist', 'Other']
  },
  details: {
    type: String,
    required: false,
  },
  subscribers:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ngo',
    required: false,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export const Ticket = mongoose.model('Ticket', ticketSchema);

