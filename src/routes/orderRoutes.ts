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

// සියලුම Order routes සඳහා ලොගින් වීම අනිවාර්ය වේ
router.use(authenticate);

/**
 * 🛠️ IMPORTANT: Routing Order
 * Dynamic routes (:id) වලට වඩා නිශ්චිත routes (static paths) ඉහළින් තිබිය යුතුය.
 */

// --- විකුණුම්කරු (Seller) සඳහා Routes ---
router.get('/seller/all', isSeller, getSellerOrders); // Seller ට අදාළ ඇණවුම් පමණක්
router.patch('/:id/status', isSeller, updateOrderStatus); // ඇණවුමේ තත්ත්වය වෙනස් කිරීම

// --- පොදු පාරිභෝගිකයා සඳහා Routes ---
router.post('/', createOrder); // නව ඇණවුමක් සෑදීම
router.get('/', getOrders); // තමන්ගේ ඇණවුම් ලැයිස්තුව

// --- ID එක අනුව සිදුකරන ක්‍රියාවන් (අන්තිමට තබන්න) ---
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;