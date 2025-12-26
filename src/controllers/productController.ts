import { Request, Response } from 'express';
import Product from '../models/Product';
import { authenticate, isSeller } from '../middleware/auth';
import { upload } from '../middleware/upload';

export const createProduct = [authenticate, isSeller, upload.single('image'), async (req: any, res: Response) => {
  const { name, description, price, stock } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      image: req.file ? req.file.path : null,  // <-- image undefined නම් null දාන්න
      seller: req.user._id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}];

export const getProducts = async (req: Request, res: Response) => {
  const products = await Product.find().populate('seller', 'name');
  res.json(products);
};

// Add more: getById, update, delete