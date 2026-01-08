import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct, getProductById } from '../controllers/productController';
import { authenticate, isSeller } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById); // අලුතින් එක් කළ පේළිය
router.post('/', authenticate, isSeller, upload.single('image'), createProduct);
router.put('/:id', authenticate, isSeller, upload.single('image'), updateProduct);
router.delete('/:id', authenticate, isSeller, deleteProduct);

export default router;