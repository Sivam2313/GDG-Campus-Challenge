import express from 'express';
import { addPatient, setClosestNgoSubscribers, showDoctorsList } from '../controllers/patientController.js';
import { get } from 'mongoose';
const router = express.Router();

// Route to register a new patient
router.post('/register', addPatient);
router.get('/findClosestNgos', setClosestNgoSubscribers);
router.get('/bestPossibleDoctor', showDoctorsList);

export const patientRoutes = router;