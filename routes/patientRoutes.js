import express from 'express';
import { addPatient, setClosestNgoSubscribers, showDoctorsList, selectDoctorFromList, loginPatient } from '../controllers/patientController.js';
import { protectPatient } from '../middleware/authMiddleware.js'
const router = express.Router();

// Route to register a new patient
router.post('/register', addPatient);
router.post('/login', loginPatient);
router.get('/findClosestNgos', setClosestNgoSubscribers);
router.get('/bestPossibleDoctors',protectPatient, showDoctorsList);
router.post('/selectYourDoctor', protectPatient, selectDoctorFromList);

export const patientRoutes = router;