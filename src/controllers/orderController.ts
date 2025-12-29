import { Request, Response } from 'express';
import Order from '../models/Order';
import { authenticate, isSeller } from '../middleware/authMiddleware';

export const createOrder = [authenticate, async (req: any, res: Response) => {
  const { products, total } = req.body;
  try {
    const order = new Order({ user: req.user.sub, products, total });
    await order.save();
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const getSellerOrders = [authenticate, isSeller, async (req: any, res: Response) => {
  try {
    // 1. සියලුම ඇණවුම් ලබාගෙන Product විස්තර (Product details) ඇතුළත් කරගන්න (Populate)
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'products.product',
        model: 'Product'
      })
      .sort({ createdAt: -1 }); // අලුත්ම ඇණවුම් මුලට

    // 2. ලොග් වී සිටින Seller ගේ ID එකට (req.user.sub) ගැලපෙන ඇණවුම් පමණක් වෙන් කරන්න
    const sellerOrders = orders.filter(order => 
      order.products.some((item: any) => {
        // Product එකේ ඇති seller ID එක ලොග් වී සිටින අයගේ ID එකට සමානදැයි බලයි
        const sellerId = item.product?.seller?.toString() || item.product?.seller?._id?.toString();
        return sellerId === req.user.sub;
      })
    );

    res.json(sellerOrders);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching seller orders", error: err.message });
  }
}];

// පාරිභෝගිකයෙකුට (Customer) තමන් මිලදී ගත් ඇණවුම් බැලීමට
export const getOrders = [authenticate, async (req: any, res: Response) => {
  try {
    // Token එකේ ID එක තිබෙන්නේ 'sub' වල නිසා req.user.sub භාවිතා කරමු
    const orders = await Order.find({ user: req.user.sub })
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
}];