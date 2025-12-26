import express from 'express';
import { addToCart } from '../controllers/cartController';

const router = express.Router();

router.post('/', addToCart);

export default router;