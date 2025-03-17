import asyncHandler from 'express-async-handler';
import Doctor from '../models/doctorSchema.js'
import { geocodeAddress } from '../utils/geocode.js';

const addDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, contact, credentials, address } = req.body;

  if (!name || !specialization || !contact || !credentials || !address) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  
  const {latitude, longitude} = await geocodeAddress(address)
  if(!latitude || !longitude){
    res.status(500);
    throw new Error('Could not retrieve coordinates')
  }

  const existingDoctor = await Doctor.findOne({contact})

  if(existingDoctor){
    res.status(400);
    throw new Error('Doctor already exists')
  }

  const doctor = await Doctor.create({
    name,
    specialization,
    contact,
    credentials,
    latitude, longitude
  });

  res.status(201).json(doctor);
});

export { addDoctor };