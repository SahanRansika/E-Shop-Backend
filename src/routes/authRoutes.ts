import express from 'express';
import { register, login, refreshToken } from '../controllers/authController';

const router = express.Router();

router.post('/register', register); // Hamoma 'user' widihata register wenne
router.post('/login', login);
router.post('/refresh-token', refreshToken);

export default router;