import express from 'express';
import { initiatePayment, notify } from '../controllers/paymentController';

const router = express.Router();

/**
 * Initiate PayHere payment (sandbox or live)
 * POST /api/payments/initiate
 * Body: { orderId: string, amount: number }
 */
router.post('/initiate', initiatePayment);

/**
 * PayHere IPN / notification endpoint
 * POST /api/payments/notify
 * Body: { order_id: string, payhere_amount: string, status_code: string }
 */
router.post('/notify', notify);

export default router;
