import asyncHandler from 'express-async-handler';
import expressAsyncHandler from 'express-async-handler';
import Doctor from '../models/doctorSchema.js'
import { geocodeAddress } from '../utils/geocode.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Appointment from '../models/appointmentSchema.js';
import dotenv from 'dotenv';

dotenv.config();

export const addDoctor = asyncHandler(async (req, res) => {

  const { name, specialization, contact, credentials, address } = req.body;
  
  if (!name || !specialization || !contact || !credentials || !address) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  const isValidPhoneNumber = /^(\+91\s?|0)?[6-9][0-9]{9}$/.test(contact);
  if(!isValidPhoneNumber){
    res.status(400);
    throw new Error('Invalid Contact Details');
  }
  const { latitude, longitude } = await geocodeAddress(address);
  if (!latitude || !longitude) {
    res.status(500);
    throw new Error('Could not retrieve coordinates');
  }
  const existingDoctor = await Doctor.findOne({ contact });
  if (existingDoctor) {
    res.status(400);
    throw new Error('Doctor already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedCredentials = await bcrypt.hash(credentials, salt);

  const doctor = await Doctor.create({
    name,
    specialization,
    contact,
    credentials: hashedCredentials,
    latitude,
    longitude,
  });

  const token = jwt.sign(
    { doctorId: doctor._id, contact: doctor.contact },
    process.env.SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.status(200).json({token});
});


export const loginDoctor = asyncHandler(async (req, res) => {
  const { contact, credentials } = req.body;
  if (!contact || !credentials) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  const doctor = await Doctor.findOne({ contact });
  if (!doctor) {
    res.status(400);
    throw new Error('Doctor not found');
  }

  const isMatch = await bcrypt.compare(credentials, doctor.credentials);
  if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
  }
  const token = jwt.sign({ doctorId: doctor._id, contact: doctor.contact }, process.env.SECRET_KEY, { expiresIn: '1h' });
  
  res.status(200).json({ token });
});


export const addAvailability = asyncHandler(async (req, res) => {

  const { date, slots } = req.body;
  if (!date || !slots || !Array.isArray(slots) || slots.length === 0) {
    res.status(400);
    throw new Error('Invalid availability data');
  }
  const doctor = await Doctor.findById(req.doctor.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }

  slots.forEach((slot) => {
    const existingDate = doctor.availability.find((item) =>
      item.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    const startTime = new Date(date);
    const endTime = new Date(date);
  
    const [startHours, startMinutes] = slot.startTime.split(':');
    const [endHours, endMinutes] = slot.endTime.split(':');
    startTime.setHours(startHours, startMinutes);
    endTime.setHours(endHours, endMinutes);
  
    const newSlot = {
      startTime,
      endTime,
      isBooked: slot.isBooked || false,
    };
  
    if (existingDate) {
      const overlapIndex = existingDate.slots.findIndex((existingSlot) => {
        return (
          (startTime >= existingSlot.startTime && startTime < existingSlot.endTime) ||
          (endTime > existingSlot.startTime && endTime <= existingSlot.endTime) ||
          (startTime <= existingSlot.startTime && endTime >= existingSlot.endTime)
        );
      });
  
      if (overlapIndex !== -1) {
        if (!existingDate.slots[overlapIndex].isBooked) {
          existingDate.slots.splice(overlapIndex, 1);
          existingDate.slots.push(newSlot);
          console.log(`Replaced overlapping slot on ${date}`);
        } else {
          res.status(400);
          throw new Error(`Overlapping slot is already booked on ${date}`);
        }
      } else {
        existingDate.slots.push(newSlot);
      }
    } else {
      doctor.availability.push({ date: new Date(date), slots: [newSlot] });
    }
  });
  
  await doctor.save();
  res.status(200).json({ message: 'Availability added successfully', availability: doctor.availability });

});


const createJitsiLink = (meetingName) => {
  const baseUrl = 'https://meet.jit.si/';
  return `${baseUrl}${encodeURIComponent(meetingName)}`;
};

export const showAppointments = expressAsyncHandler(async (req, res) => {
  const doctorId  = req.doctor.doctorId;

  if (!doctorId) {
    res.status(400);
    throw new Error('Doctor ID is required');
  }

  const appointments = await Appointment.find({ doctorId })
    .populate('patientId', 'id name phone')
    .sort({ date: 1, startTime: 1 });

  if (!appointments.length) {
    res.status(404);
    throw new Error('No appointments found');
  }

  const updatedAppointments = appointments.map((appointment) => {
    const meetingName = `doctor-${appointment.doctorId}-patient-${appointment.patientId._id}-${appointment.date.toISOString().split('T')[0]}`;
    const meetLink = createJitsiLink(meetingName);

    return {
      _id: appointment._id,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      meetLink,
      meetStartTime: appointment.startTime,
      meetEndTime: appointment.endTime,
    };
  });

  res.status(200).json(updatedAppointments);
});


export const showSlots = expressAsyncHandler(async (req, res) => {
  const { doctorId, date } = req.body;

  if (!doctorId || !date) {
      return res.status(400).json({ message: 'Doctor ID and date are required' });
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
  }

  const dateAvailability = doctor.availability.find(
      (availability) => availability.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
  );

  if (!dateAvailability) {
      return res.status(404).json({ message: `No available slots on ${date}` });
  }
  const availableSlots = dateAvailability.slots;

  res.status(200).json({
      date,
      availableSlots,
  });
});

export const getAllDoctors = expressAsyncHandler(async (req, res) => {
  const doctors = await Doctor.find();
  res.status(200).json(doctors);
})
