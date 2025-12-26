import { Request, Response } from 'express';
import Order from '../models/Order';
import { authenticate } from '../middleware/auth';

export const createOrder = [authenticate, async (req: any, res: Response) => {
  const { products, total } = req.body;
  try {
    const order = new Order({ user: req.user._id, products, total });
    await order.save();
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const getOrders = [authenticate, async (req: any, res: Response) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
}];

// Add seller-specific orders, update status