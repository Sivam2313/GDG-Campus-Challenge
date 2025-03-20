import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
dotenv.config();

export const protect = asyncHandler(async (req, res, next) => {
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