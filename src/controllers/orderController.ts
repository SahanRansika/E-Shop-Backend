import { Request, Response } from 'express';
import Order from '../models/Order';
import { authenticate, isSeller } from '../middleware/authMiddleware';

// Create order
export const createOrder = [
  authenticate,
  async (req: any, res: Response) => {
    try {
      const { products, total, address } = req.body;

      const order = new Order({
        user: req.user.sub,
        products,
        total,
        address,
      });

      await order.save();
      res.status(201).json(order);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];

// Customer orders
export const getOrders = [
  authenticate,
  async (req: any, res: Response) => {
    const orders = await Order.find({ user: req.user.sub })
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  },
];

// Single order
export const getOrderById = [
  authenticate,
  async (req: any, res: Response) => {
    const order = await Order.findById(req.params.id)
      .populate('products.product');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  },
];

// Cancel order
export const cancelOrder = [
  authenticate,
  async (req: any, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = 'cancelled';
    await order.save();

    res.json(order);
  },
];

// Seller – view own orders
export const getSellerOrders = [
  authenticate,
  isSeller,
  async (req: any, res: Response) => {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product');

    const sellerOrders = orders.filter(order =>
      order.products.some((item: any) =>
        item.product.seller.toString() === req.user.sub
      )
    );

    res.json(sellerOrders);
  },
];

// Update order status (seller)
export const updateOrderStatus = [
  authenticate,
  isSeller,
  async (req: Request, res: Response) => {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  },
];
