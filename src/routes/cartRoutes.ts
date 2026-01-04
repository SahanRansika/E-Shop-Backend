import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { addToCart, getCart, clearCart } from '../controllers/cartController';

const router = express.Router();

router.post('/', authenticate, addToCart);
router.get('/', authenticate, getCart);
router.delete('/', authenticate, clearCart);

export default router;
