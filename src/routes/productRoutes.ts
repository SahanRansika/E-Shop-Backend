import express from 'express';
import { 
  createProduct, 
  getProducts, 
  updateProduct, // මෙය අලුතින් එක් කරන්න
  deleteProduct  // මෙය අලුතින් එක් කරන්න
} from '../controllers/productController';
import { upload } from '../middleware/upload';
import { authenticate, isSeller } from '../middleware/authMiddleware'; // Auth middleware තිබේ නම්

const router = express.Router();

// 1. සියලුම භාණ්ඩ ලබා ගැනීම
router.get('/', getProducts);

// 2. අලුත් භාණ්ඩයක් සෑදීම
router.post('/', authenticate, isSeller, upload.single('image'), createProduct);

// 3. භාණ්ඩයක් යාවත්කාලීන කිරීම (Update)
// මෙහිදී ද image එකක් තිබිය හැකි නිසා upload.single භාවිතා කළ හැක
router.put('/:id', authenticate, isSeller, upload.single('image'), updateProduct);

// 4. භාණ්ඩයක් මකා දැමීම (Delete)
router.delete('/:id', authenticate, isSeller, deleteProduct);

export default router;