import { Request, Response } from 'express';
import Cart from '../models/Cart';
import { authenticate } from '../middleware/authMiddleware';

export const addToCart = [authenticate, async (req: any, res: Response) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, products: [] });
    const index = cart.products.findIndex(p => p.product && p.product.toString() === productId);
    if (index > -1) cart.products[index].quantity += quantity;
    else cart.products.push({ product: productId, quantity });
    await cart.save();
    res.json(cart);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

// Add remove, get cart