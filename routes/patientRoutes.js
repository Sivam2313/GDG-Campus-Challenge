import express from 'express';
import { addPatient, setClosestNgoSubscribers } from '../controllers/patientController.js';
const router = express.Router();

// Route to register a new patient
router.post('/register', addPatient);
router.get('/findClosestNgos', setClosestNgoSubscribers);

export const patientRoutes = router;