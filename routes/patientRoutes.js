import express from 'express';
import { addPatient, setClosestNgoSubscribers, showDoctorsList, selectDoctorFromList, loginPatient, showAppointments } from '../controllers/patientController.js';
import { protectPatient } from '../middleware/authMiddleware.js'
const router = express.Router();

// Route to register a new patient
router.post('/register', addPatient);
router.post('/login', loginPatient);
router.get('/findClosestNgos', setClosestNgoSubscribers);
router.get('/bestPossibleDoctors',protectPatient, showDoctorsList);
router.post('/selectYourDoctor', protectPatient, selectDoctorFromList);
router.get('/appointments', protectPatient, showAppointments);

export const patientRoutes = router;