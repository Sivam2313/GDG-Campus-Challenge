import express from 'express';
import { addDoctor } from '../controllers/doctorController.js';
const router = express.Router();

router.post('/register', addDoctor);

export const doctorRoutes = router;