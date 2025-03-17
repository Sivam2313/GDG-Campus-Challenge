import express from 'express';
import { addTicket, closeTicket } from '../controllers/ticketController.js';
const router = express.Router();

router.post('/create', addTicket);
router.post('/close', closeTicket);

export const ticketRoutes = router;