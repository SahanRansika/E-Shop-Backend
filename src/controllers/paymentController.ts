import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order'; // ඔබේ Model එක නිවැරදිව import කරන්න

// 1. පේමන්ට් එක ආරම්භ කර Hash එක සෑදීම
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET;
    const currency = 'LKR';
    const formattedAmount = Number(amount).toFixed(2);

    if (!merchant_id || !merchant_secret) {
      return res.status(500).json({ message: 'PayHere credentials not configured' });
    }

    const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
    const hash = crypto
      .createHash('md5')
      .update(merchant_id + orderId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return res.status(200).json({
      merchant_id,
      order_id: orderId,
      amount: formattedAmount,
      currency,
      hash,
      return_url: process.env.PAYHERE_RETURN_URL,
      cancel_url: process.env.PAYHERE_CANCEL_URL,
      notify_url: process.env.PAYHERE_NOTIFY_URL,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate payment' });
  }
};

// 2. PayHere Notification එක ලබාගෙන Status Update කිරීම
export const paymentNotify = async (req: Request, res: Response) => {
  console.log("🔔 PayHere Notification Received!");
  
  try {
    const { order_id, status_code, md5sig, payhere_amount, payhere_currency } = req.body;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || "";

    // Hash එක Verify කිරීම (Security සඳහා)
    const hashedSecret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
    const expectedMd5sig = crypto
      .createHash('md5')
      .update(process.env.PAYHERE_MERCHANT_ID + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
      .digest('hex')
      .toUpperCase();

    if (md5sig === expectedMd5sig && status_code === "2") {
      console.log(`✅ Payment Success for Order: ${order_id}`);
      // Database එකේ Status එක 'paid' ලෙස Update කිරීම
      await Order.findByIdAndUpdate(order_id, { status: "paid" });
      console.log("🚀 Database Status Updated to: PAID");
    } else {
      console.log(`❌ Payment Failed or Hash Mismatch. Status: ${status_code}`);
    }

    res.status(200).send(); // PayHere එකට සාර්ථක බව දැනුම් දීම
  } catch (error) {
    console.error("🔥 Notify Error:", error);
    res.status(500).send();
  }
};