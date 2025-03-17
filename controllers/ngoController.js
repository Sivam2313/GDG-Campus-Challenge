import asyncHandler from 'express-async-handler';
import { geocodeAddress } from '../utils/geocode.js';
import Ngo from '../models/ngoSchema.js';

const addNgo = asyncHandler(async (req, res) => {
  const { name, contact, orgSize, address, operatingArea } = req.body;

  if (!name || !orgSize || !contact || !operatingArea || !address) {
    res.status(400);
    throw new Error('Please add all fields');
  }
  
  const {latitude, longitude} = await geocodeAddress(address)
  if(!latitude || !longitude){
    res.status(500);
    throw new Error('Could not retrieve coordinates')
  }

  const existingNgo = await Ngo.findOne({contact})

  if(existingNgo){
    res.status(400);
    throw new Error('Ngo already exists')
  }

  const ngo = await Ngo.create({
    name,
    orgSize,
    contact,
    operatingArea,
    latitude, longitude
  });

  res.status(201).json(ngo);
});

export { addNgo };