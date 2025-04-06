import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { geocodeAddress } from '../utils/geocode.js';
import { Ticket } from '../models/ticketSchema.js';
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

export const showTickets = asyncHandler(async (req, res) => {
  try {
    const { ngoId } = req.query;

    if (!ngoId) {
      return res.status(400).json({ message: 'ngoId is required' });
    }

    const tickets = await Ticket.find({ subscribers: ngoId })
      .populate('subscribers', 'name contact') 
      .sort({ createdAt: -1 });

    if (!tickets.length) {
      return res.status(404).json({ message: 'No tickets found for this NGO' });
    }

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve tickets', error: error.message });
  }
});


export const resolveTickets = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await Ticket.findById(ticketId);
    console.log(ticket)
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.resolved = true;
    await ticket.save();

    res.status(200).json({ message: 'Ticket resolved successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve ticket', error: error.message });
  }
});


