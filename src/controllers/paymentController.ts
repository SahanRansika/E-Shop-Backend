import { Request, Response } from 'express';
import crypto from 'crypto';
import { payhereConfig } from '../config/payhere';
import Order from '../models/Order';
import { sendEmail } from '../services/emailService';

interface InitiatePaymentBody {
  orderId: string;
  amount: number;
}

interface NotifyBody {
  order_id: string;
  payhere_amount: string;
  status_code: string;
}

export const initiatePayment = async (req: Request<{}, {}, InitiatePaymentBody>, res: Response) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Order ID and amount are required' });
    }

    // Sandbox / Live hash
    const hash = crypto
      .createHash('md5')
      .update(`${payhereConfig.merchantID}${orderId}${amount}LKR${payhereConfig.merchantSecret}`)
      .digest('hex')
      .toUpperCase();

    res.json({
      merchantID: payhereConfig.merchantID,
      orderId,
      amount,
      hash,
      returnUrl: payhereConfig.returnUrl,
      cancelUrl: payhereConfig.cancelUrl,
      notifyUrl: payhereConfig.notifyUrl,
      currency: 'LKR',
    });
  } catch (error: any) {
    console.error('Initiate Payment Error:', error.message);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
};

export const notify = async (req: Request<{}, {}, NotifyBody>, res: Response) => {
  try {
    const { order_id, payhere_amount, status_code } = req.body;

    // Only process successful payments
    if (status_code === '2') { // Paid
      const order = await Order.findById(order_id).populate<{ user: { email: string } }>('user', 'email');

      if (order && order.user) {
        await sendEmail(order.user.email, 'Order Paid', 'Your order has been paid successfully!');
      }
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error('Payment Notify Error:', error.message);
    res.sendStatus(500);
  }
};
