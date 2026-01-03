import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import cartRoutes from './routes/cartRoutes';
import paymentRoutes from './routes/paymentRoutes';

import errorHandler from './middleware/errorHandler';
import './config/database'; // DB connect

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * 🔐 CORS Configuration
 * - PayHere notify_url → no CORS needed (server-to-server)
 * - Frontend (Vite) → allow origin
 */
app.use(
  cors({
    origin: [
      'http://localhost:5173', // Vite frontend
      'http://localhost:3000', // React (optional)
    ],
    credentials: true,
  })
);

/**
 * 🔥 Body parsers (REQUIRED for PayHere notify)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ API Routes
 */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);

/**
 * 🩺 Health Check
 */
app.get('/api/health', (_req, res) => {
  res.status(200).send('OK');
});

/**
 * ❌ Global Error Handler
 */
app.use(errorHandler);

/**
 * 🚀 Start Server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
