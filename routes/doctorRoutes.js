import express from 'express';
import { addDoctor, loginDoctor, addAvailability, showAppointments, showSlots, getAllDoctors } from '../controllers/doctorController.js';
import { protectDoctor } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', addDoctor);
router.post('/login',loginDoctor);
router.get('/allDoctors',getAllDoctors);
router.post('/availability', protectDoctor, addAvailability);
router.get('/appointments', protectDoctor, showAppointments);
router.get('/slots', protectDoctor, showSlots);

export const doctorRoutes = router;