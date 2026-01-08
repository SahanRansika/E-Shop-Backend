import { Request, Response } from 'express';
import crypto from 'crypto';
import Order from '../models/Order';
import Payment from '../models/Payment'; // අලුතින් සෑදූ Payment model එක

/**
 * 1. PayHere වෙත යැවීමට අවශ්‍ය Hash එක සහ දත්ත සකස් කිරීම
 */
export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    const merchant_id = process.env.PAYHERE_MERCHANT_ID;
    const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET || "";
    const currency = 'LKR';

    // Amount එක හරියටම දශමස්ථාන 2කට format කිරීම (PayHere අනිවාර්ය අවශ්‍යතාවයකි)
    const formattedAmount = Number(amount).toFixed(2);

    // Merchant Secret එක MD5 කර Uppercase කිරීම
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret.trim())
      .digest('hex')
      .toUpperCase();

    // Hash එක සෑදීම: merchant_id + order_id + amount + currency + hashedSecret
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
      notify_url: process.env.PAYHERE_NOTIFY_URL // .env එකෙන් ලබා ගනී
    });
  } catch (error: any) {
    console.error("Hash Error:", error);
    res.status(500).json({ message: 'Hash generation failed' });
  }
};

/**
 * 2. PayHere Server එකෙන් එන Notification (IPN) එක ලබාගෙන DB Update කිරීම
 */
export const paymentNotify = async (req: Request, res: Response) => {
  console.log("🔔 PayHere Notification Received!");
  
  try {
    const { 
      merchant_id, 
      order_id, 
      status_code, 
      md5sig, 
      payhere_amount, 
      payhere_currency,
      payment_id, // PayHere Reference ID
      method,     // Visa, Master, etc.
      status_message
    } = req.body;

    const merchant_secret = (process.env.PAYHERE_MERCHANT_SECRET || "").trim();

    // Verification Step 1: Secret එක MD5 කරන්න
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchant_secret)
      .digest('hex')
      .toUpperCase();

    // Verification Step 2: ලැබුණු දත්ත වලින් නැවත Hash එකක් සාදා md5sig සමඟ සැසඳීම
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

    // ආරක්ෂිත බව තහවුරු කිරීම
    if (md5sig === expectedMd5sig) {
      if (status_code === "2") {
        console.log(`✅ Success: Order ${order_id} is PAID`);

        // 1. Order status එක 'paid' ලෙස සහ Payment ID එක Update කරන්න
        await Order.findByIdAndUpdate(order_id, { 
          status: "paid",
          paymentId: payment_id 
        });

        // 2. අලුත් Payment Table එකට විස්තර ඇතුළත් කරන්න
        const newPayment = new Payment({
          orderId: order_id,
          paymentId: payment_id,
          amount: Number(payhere_amount),
          currency: payhere_currency,
          status: 'success',
          method: method,
          rawPayHereResponse: req.body // සම්පූර්ණ response එක backup එකක් ලෙස
        });
        await newPayment.save();

        console.log("🚀 Database Updated: Order -> PAID & Payment Record Created");
      } 
      else if (status_code === "0") {
        console.log(`⏳ Pending: Order ${order_id} is awaiting confirmation`);
      } 
      else {
        console.log(`⚠️ Failed: Order ${order_id} Status ${status_code}`);
        await Order.findByIdAndUpdate(order_id, { status: "cancelled" });
      }
    } else {
      console.error("❌ Security Warning: Hash Mismatch! Request might not be from PayHere.");
    }

    // PayHere වෙත සැමවිටම 200 OK එකක් යැවිය යුතුය
    res.status(200).send("OK"); 

  } catch (error: any) {
    console.error("🔥 PayHere Notify Error:", error);
    res.status(500).send();
  }
};