import express from 'express';
import { createProduct, getProducts } from '../controllers/productController';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getProducts);
// add more routes as needed

export default router;