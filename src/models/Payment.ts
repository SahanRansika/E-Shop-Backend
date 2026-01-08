import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentId: { type: String, required: true }, // PayHere Payment ID
    transactionId: { type: String }, // PayHere Bank/Transaction ID
    amount: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    status: { type: String, required: true }, // 'success', 'failed', etc.
    method: { type: String }, // VISA, MASTER, LANKAQR etc.
    rawPayHereResponse: { type: Object }, // මුළු Response එකම Backup එකක් ලෙස
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);