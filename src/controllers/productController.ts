import { Request, Response } from 'express';
import Product from '../models/Product';
import { authenticate, isSeller } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

// 1. අලුත් භාණ්ඩයක් ඇතුළත් කිරීම (Create Product)
export const createProduct = [
  authenticate,
  isSeller,
  upload.single('image'),
  async (req: any, res: Response) => {
    try {
      const { name, description, price, stock, category } = req.body;
      
      // Cloudinary මගින් ලැබෙන පින්තූරයේ URL එක ලබා ගැනීම
      const imageUrl = req.file ? (req.file as any).path : '';

      const product = new Product({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category: category, // අලුතින් එක් කළ category එක
        image: imageUrl,
        seller: req.user.sub, // JWT Token එකෙන් ලැබෙන Seller ID එක
      });

      await product.save();
      res.status(201).json(product);
    } catch (err: any) {
      console.error("Create Product Error:", err);
      res.status(400).json({ message: err.message });
    }
  },
];

// 2. පවතින භාණ්ඩයක් යාවත්කාලීන කිරීම (Update Product)
export const updateProduct = [
  authenticate,
  isSeller,
  upload.single('image'),
  async (req: any, res: Response) => {
    try {
      // අදාළ භාණ්ඩය එම Seller ටම අයිති දැයි පරීක්ෂා කිරීම
      const product = await Product.findOne({
        _id: req.params.id,
        seller: req.user.sub,
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found or unauthorized' });
      }

      // Fields එකින් එක යාවත්කාලීන කිරීම
      if (req.body.name) product.name = req.body.name;
      if (req.body.description) product.description = req.body.description;
      if (req.body.price) product.price = Number(req.body.price);
      if (req.body.stock) product.stock = Number(req.body.stock);
      if (req.body.category) (product as any).category = req.body.category;

      // අලුත් පින්තූරයක් ඇත්නම් පමණක් URL එක වෙනස් කිරීම
      if (req.file) {
        product.image = (req.file as any).path;
      }

      await product.save();
      res.json(product);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
];

// 3. සියලුම භාණ්ඩ ලබා ගැනීම (Get All Products)
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 4. භාණ්ඩයක් මකා දැමීම (Delete Product)
export const deleteProduct = [
  authenticate,
  isSeller,
  async (req: any, res: Response) => {
    try {
      const product = await Product.findOneAndDelete({
        _id: req.params.id,
        seller: req.user.sub,
      });

      if (!product) {
        return res.status(404).json({ message: 'Product not found or unauthorized' });
      }

      res.json({ message: 'Product deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
];