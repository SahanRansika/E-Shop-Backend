import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';

// 1. පේමන්ට් එක ආරම්භ කර Hash එක සෑදීම
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const currency = 'LKR';
    
    // PayHere පද්ධතියට සැමවිටම දශමස්ථාන 2ක් සහිත අගයක් අවශ්‍ය වේ (උදා: 500.00)
    const formattedAmount = Number(amount).toFixed(2);

    if (!merchant_id || !merchant_secret) {
      console.error("❌ PayHere Credentials Missing");
      return res.status(500).json({ message: 'PayHere credentials not configured' });
    }

    // STEP 1: Secret එක MD5 කර Uppercase කරන්න
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret.trim())
      .digest('hex')
      .toUpperCase();

    // STEP 2: Initiate කිරීමට අවශ්‍ය Hash එක සෑදීම
    const hash = crypto
      .createHash('md5')
      .update(merchant_id + orderId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    console.log(`✅ Hash Created for Order: ${orderId}`);

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
    console.error("🔥 Initiate Error:", error);
    res.status(500).json({ message: 'Failed to initiate payment' });
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