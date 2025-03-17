import express from 'express';
import { addNgo } from '../controllers/ngoController.js';
const router = express.Router();

router.post('/register', addNgo);

export const ngoRoutes = router;