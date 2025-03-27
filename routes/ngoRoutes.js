import express from 'express';
import { addNgo, loginNgo } from '../controllers/ngoController.js';
const router = express.Router();

router.post('/register', addNgo);
router.post('/login', loginNgo)

export const ngoRoutes = router;