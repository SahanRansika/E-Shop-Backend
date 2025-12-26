import express from 'express';
import { initiatePayment, notify } from '../controllers/paymentController';

const router = express.Router();

router.post('/initiate', initiatePayment);
router.post('/notify', notify);

export default router;