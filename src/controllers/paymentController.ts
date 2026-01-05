import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const currency = 'LKR';

    // 1. Amount එක දශමස්ථාන 2කට හරියටම format කිරීම (උදා: 500.00)
    const formattedAmount = Number(amount).toFixed(2);

    // 2. Secret එක MD5 කර Uppercase කිරීම
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret.trim())
      .digest('hex')
      .toUpperCase();

    // 3. Hash එක සෑදීම (පෙළගැස්ම ඉතා වැදගත්)
    const hash = crypto
      .createHash('md5')
      .update(merchant_id + orderId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return res.status(200).json({
      merchant_id,
      order_id: orderId,
      amount: formattedAmount, // මෙම අගයම Frontend එකේ භාවිතා කළ යුතුය
      currency,
      hash
    });
  } catch (error) {
    res.status(500).json({ message: 'Hash generation failed' });
  }
};

// 2. PayHere Notification එක ලැබුණු විට Database Update කිරීම
export const paymentNotify = async (req: Request, res: Response) => {
  console.log("🔔 PayHere Notification Received!");
  
  try {
    const { 
      merchant_id, 
      order_id, 
      status_code, 
      md5sig, 
      payhere_amount, 
      payhere_currency 
    } = req.body;

    const merchant_secret = (process.env.PAYHERE_MERCHANT_SECRET || "").trim();

    // Verification Step 1: Secret එක MD5 කරන්න
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret)
      .digest('hex')
      .toUpperCase();

    // Verification Step 2: ලැබුණු දත්ත වලින් Hash එක සාදා MD5Sig සමඟ සැසඳීම
    const expectedMd5sig = crypto
      .createHash('md5')
      .update(
        merchant_id + 
        order_id + 
        payhere_amount + 
        payhere_currency + 
        status_code + 
        hashedSecret
      )
      .digest('hex')
      .toUpperCase();

    if (md5sig === expectedMd5sig) {
      if (status_code === "2") {
        console.log(`✅ Success: Order ${order_id} is PAID`);
        await Order.findByIdAndUpdate(order_id, { status: "paid" });
        console.log("🚀 Database Updated: Status -> PAID");
      } else {
        console.log(`⚠️ Payment Status: ${status_code}`);
        // Status -2 නම් අසාර්ථක වූ බව සටහන් කරන්න
        await Order.findByIdAndUpdate(order_id, { status: "failed" });
      }
    } else {
      console.log("❌ Hash Mismatch! Security Violation.");
    }

    // PayHere වෙත 200 OK එකක් යැවීම අනිවාර්ය වේ
    res.status(200).send(); 
  } catch (error) {
    console.error("🔥 Notify Error:", error);
    res.status(500).send();
  }
};