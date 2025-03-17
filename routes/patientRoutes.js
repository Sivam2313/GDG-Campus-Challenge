import express from 'express';
import { addPatient, getClosestNgo } from '../controllers/patientController.js';
const router = express.Router();

// Route to register a new patient
router.post('/register', addPatient);
router.get('/findClosestNgos', getClosestNgo);

export const patientRoutes = router;