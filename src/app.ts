import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import cartRoutes from './routes/cartRoutes';
import paymentRoutes from './routes/paymentRoutes';
import userRoutes from './routes/userRoutes';

import errorHandler from './middleware/errorHandler';
import './config/database'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 CORS Configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

/**
 * 🔥 Body parsers
 * PayHere notify_url එකෙන් එන්නේ x-www-form-urlencoded දත්ත බැවින් 
 * extended: true තිබීම අනිවාර්ය වේ.
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ✅ API Routes
 */
// Payment routes මුලින්ම තැබීම ආරක්ෂිතයි (Public Access සඳහා)
app.use('/api/payments', paymentRoutes); 

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);

/**
 * 🩺 Health Check
 */
app.get('/api/health', (_req, res) => {
  res.status(200).send('Backend is running smoothly!');
});

// ❌ Global Error Handler
app.use(errorHandler);

// 🚀 Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});