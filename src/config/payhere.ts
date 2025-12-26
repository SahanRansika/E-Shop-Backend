import dotenv from 'dotenv';

dotenv.config();

export const payhereConfig = {
  merchantID: process.env.PAYHERE_MERCHANT_ID,
  merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
  notifyUrl: 'http://localhost:5000/api/payments/notify', // Update for prod
  returnUrl: 'http://localhost:3000/order-success', // Frontend URL
  cancelUrl: 'http://localhost:3000/order-cancelled' // Frontend URL
};