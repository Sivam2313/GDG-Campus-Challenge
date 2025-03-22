import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true }, 
    isBooked: { type: Boolean, default: false },
});

const availabilitySchema = new mongoose.Schema({
    day: { 
        type: String, 
        required: true, 
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] 
    },
    slots: [slotSchema],
});

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    specialization: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    credentials: {
        type: String,
        required: true,
    },
    availability: [availabilitySchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
