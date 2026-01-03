import { Router } from 'express';
import { initiatePayment, paymentNotify } from '../controllers/paymentController';

const router = Router();

// Frontend එකෙන් Hash එක ඉල්ලන තැන
router.post('/initiate', initiatePayment);

// PayHere Server එකෙන් Payment status එක එවන තැන
router.post('/notify', paymentNotify);

export default router;