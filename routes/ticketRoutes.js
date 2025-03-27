import express from 'express';
import { addTicket, closeTicket } from '../controllers/ticketController.js';
import { protectDoctor, protectNgo } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/create', protectDoctor, addTicket);
router.post('/close', protectNgo, closeTicket);

export const ticketRoutes = router;