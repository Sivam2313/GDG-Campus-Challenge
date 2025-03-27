import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { geocodeAddress } from '../utils/geocode.js';
import Ngo from '../models/ngoSchema.js';

export const addNgo = asyncHandler(async (req, res) => {
  const { name, contact, orgSize, address, operatingArea } = req.body;

  if (!name || !orgSize || !contact || !operatingArea || !address) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const existingNgo = await Ngo.findOne({ contact });
  if (existingNgo) {
    res.status(400);
    throw new Error("Ngo already exists");
  }

  const { latitude, longitude } = await geocodeAddress(address);
  if (!latitude || !longitude) {
    res.status(500);
    throw new Error("Could not retrieve coordinates");
  }

  const ngo = {
    name,
    orgSize,
    contact,
    operatingArea,
    latitude,
    longitude,
  };

  const createdNgo = await Ngo.create(ngo);

  const token = jwt.sign(
    { ngoId: createdNgo._id, contact: createdNgo.contact },
    process.env.SECRET_KEY,
    { expiresIn: '30d' }
  );

  res.status(201).json({token});
});

export const loginNgo = asyncHandler(async (req, res) => {
  const { contact, name } = req.body;

  if (!contact || !name) {
    res.status(400);
    throw new Error("Please provide all fields");
  }

  const ngo = await Ngo.findOne({ contact });
  if (!ngo) {
    res.status(400);
    throw new Error("Ngo does not exist");
  }

  const isMatch = ngo.name === name;
  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid NGO name");
  }

  const token = jwt.sign(
    { ngoId: ngo._id, contact: ngo.contact },
    process.env.SECRET_KEY,
    { expiresIn: '30d' }
  );

  res.status(201).json({ token });
});
