import express from 'express';
import { addNgo, loginNgo, showTickets, resolveTickets } from '../controllers/ngoController.js';
import { protectNgo } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', addNgo);
router.post('/login', loginNgo);
router.get('/tickets', protectNgo, showTickets);
router.put('/resolveTicket', protectNgo, resolveTickets);

export const ngoRoutes = router;