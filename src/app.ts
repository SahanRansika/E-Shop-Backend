import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import cartRoutes from './routes/cartRoutes';
import paymentRoutes from './routes/paymentRoutes';
import errorHandler from './middleware/errorHandler';
import './config/database'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // ඔබේ Frontend URL එක
  credentials: true
}));
app.use(express.json());

// 🔥 මෙන්න මේ පේළිය අනිවාර්යයෙන්ම එකතු කරන්න:
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => res.send('OK'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));