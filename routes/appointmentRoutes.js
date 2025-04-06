import express from 'express';
import { addAppointment } from '../controllers/appointmentController.js';
import { protectPatient } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/addAppointment', protectPatient, addAppointment);

export const appointmentRoutes = router;