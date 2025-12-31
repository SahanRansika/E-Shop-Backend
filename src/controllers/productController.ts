import { Request, Response } from 'express';
import Product from '../models/Product';

/**
 * CREATE PRODUCT
 * POST /api/products
 * (Seller only)
 */
export const createProduct = async (req: any, res: Response) => {
  try {
    console.log('--- Create Product ---');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const imageUrl = req.file ? req.file.path : '';

    const product = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock || 0),
      category,
      image: imageUrl,
      seller: req.user.sub || req.user.id,
    });

    await product.save();

    res.status(201).json(product);
  } catch (err: any) {
    console.error('Create Product Error:', err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * UPDATE PRODUCT
 * PUT /api/products/:id
 * (Seller only)
 */
export const updateProduct = async (req: any, res: Response) => {
  try {
    console.log('--- Update Product ---');

    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user.sub || req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found or unauthorized',
      });
    }

    const { name, description, price, stock, category } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category) product.category = category;

    if (req.file) {
      console.log('New image uploaded:', req.file.path);
      product.image = req.file.path;
    }

    await product.save();
    res.json(product);
  } catch (err: any) {
    console.error('Update Product Error:', err);
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET ALL PRODUCTS
 * GET /api/products
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate(
      'seller',
      'name email'
    );
    res.json(products);
  } catch (err: any) {
    console.error('Get Products Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE PRODUCT
 * DELETE /api/products/:id
 * (Seller only)
 */
export const deleteProduct = async (req: any, res: Response) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.sub || req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: 'Product not found or unauthorized',
      });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ message: err.message });
  }
};
