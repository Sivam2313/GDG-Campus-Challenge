import express from 'express';
import { addDoctor, loginDoctor } from '../controllers/doctorController.js';
const router = express.Router();

router.post('/register', addDoctor);
router.post('/login',loginDoctor);

export const doctorRoutes = router;