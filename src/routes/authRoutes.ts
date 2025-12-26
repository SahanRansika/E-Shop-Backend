import express from 'express';
import { register, login, refreshToken } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken); // optional but recommended

export default router;