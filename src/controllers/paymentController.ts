import { Request, Response } from 'express';
import crypto from 'crypto';
import { payhereConfig } from '../config/payhere';
import Order from '../models/Order';
import { sendEmail } from '../services/emailService';

export const initiatePayment = async (req: Request, res: Response) => {
  const { orderId, amount } = req.body;
  const hash = crypto.createHash('md5').update(`${payhereConfig.merchantID}${orderId}${amount}LKR${payhereConfig.merchantSecret}`).digest('hex').toUpperCase();
  res.json({ merchantID: payhereConfig.merchantID, orderId, amount, hash, returnUrl: payhereConfig.returnUrl, cancelUrl: payhereConfig.cancelUrl });
};

export const notify = async (req: Request, res: Response) => {
  const { order_id, payhere_amount, status_code } = req.body;

  if (status_code === '2') { // Paid
    // Populate user with email
    const order = await Order.findById(order_id).populate<{ user: { email: string } }>('user', 'email');

    if (order && order.user) {
      await sendEmail(order.user.email, 'Order Paid', 'Your order has been paid successfully!');
    }
  }

  res.sendStatus(200);
};

