import express from 'express';
import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { authenticate, isSeller } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

/**
 * GET ALL PRODUCTS
 * Public
 * GET /api/products
 */
router.get('/', getProducts);

/**
 * CREATE PRODUCT
 * Seller only
 * POST /api/products
 * multipart/form-data (image)
 */
router.post(
  '/',
  authenticate,
  isSeller,
  upload.single('image'),
  createProduct
);

/**
 * UPDATE PRODUCT
 * Seller only
 * PUT /api/products/:id
 * multipart/form-data (image optional)
 */
router.put(
  '/:id',
  authenticate,
  isSeller,
  upload.single('image'),
  updateProduct
);

/**
 * DELETE PRODUCT
 * Seller only
 * DELETE /api/products/:id
 */
router.delete(
  '/:id',
  authenticate,
  isSeller,
  deleteProduct
);

export default router;
