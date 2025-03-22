import asyncHandler from 'express-async-handler';
import Doctor from '../models/doctorSchema.js'
import { geocodeAddress } from '../utils/geocode.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const addDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, contact, credentials, address, availability } = req.body;

  if (!name || !specialization || !contact || !credentials || !address) {
    res.status(400);
    throw new Error('Please add all fields');
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
    availability,
  });

  const token = jwt.sign({ doctorId: doctor._id, contact: doctor.contact }, process.env.SECRET_KEY, { expiresIn: '1h' });

  res.status(201).json(token);
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


