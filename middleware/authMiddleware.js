import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import expressAsyncHandler from "express-async-handler";
import Patient from "../models/patientSchema.js";

dotenv.config();

export const protectDoctor = asyncHandler(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if (!decoded.doctorId || !decoded.doctorContact) {
          res.status(401);
          throw new Error("Not authorized, invalid doctor data in token");
        }
        
        req.doctor = decoded; 
        return next();
      } catch (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
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
             
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
})