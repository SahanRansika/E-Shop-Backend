import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/seller', getSellerOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
