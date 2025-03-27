import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import expressAsyncHandler from "express-async-handler";
import Patient from "../models/patientSchema.js";
import Doctor from "../models/doctorSchema.js";

dotenv.config();

export const protectDoctor = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.doctor = await Doctor.findById(decoded.doctorId);

        if (!req.doctor) {
          res.status(401);
          throw new Error('Not authorized, doctor not found');
        }

        next();
      } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
      }
    } else {
      res.status(401);
      throw new Error('Not authorized, no token');
    }
});

export const protectPatient = expressAsyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.patient = await Patient.findById(decoded.patientId);

      if (!req.patient) {
        res.status(401);
        throw new Error('Not authorized, Patient not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
})

export const protectNgo = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.ngo = await Ngo.findById(decoded.ngoId);

      if (!req.ngo) {
        res.status(401);
        throw new Error('Not authorized, NGO not found');
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
});