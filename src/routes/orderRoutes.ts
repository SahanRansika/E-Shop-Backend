import express from 'express';
import { getSellerOrders, createOrder, getOrders } from '../controllers/orderController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Seller කෙනෙකුට තමන්ගේ බඩු විකුණුනු ඇණවුම් බැලීමට
router.get('/seller', getSellerOrders);
router.post('/', createOrder);
router.get('/', authenticate, getOrders);

export default router;