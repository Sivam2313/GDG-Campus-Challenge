import asyncHandler from 'express-async-handler';
import expressAsyncHandler from 'express-async-handler';
import Appointment from '../models/appointmentSchema.js'
export const addAppointment = expressAsyncHandler(async (req, res) => {
    const { doctorId, date, startTime, endTime } = req.body;

    console.log(req.body);
    
    if (!doctorId || !date || !startTime || !endTime) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    const patientId = req.patient._id;

    const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        date,
        startTime,
        endTime,
    });

    if (appointment) {
        res.status(201).json(appointment);
    }
})