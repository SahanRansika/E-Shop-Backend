import { Router } from 'express';
import { 
    createOrder, 
    getOrders, 
    getOrderById, 
    cancelOrder, 
    getSellerOrders, 
    updateOrderStatus 
} from '../controllers/orderController';
import { authenticate, isSeller } from '../middleware/authMiddleware';

const router = Router();

// සියලුම Order routes සඳහා login වී සිටීම අනිවාර්ය වේ
router.use(authenticate);

// පාරිභෝගිකයා සඳහා routes
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// විකුණුම්කරු (Seller) සඳහා routes
router.get('/seller/all', isSeller, getSellerOrders);
router.patch('/:id/status', isSeller, updateOrderStatus);

export default router;