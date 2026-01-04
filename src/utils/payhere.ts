import crypto from 'crypto';

export const generatePayHereHash = (orderId: string, amount: number) => {
    const merchantId = process.env.PAYHERE_MERCHANT_ID || '';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    const currency = 'LKR';

    const hashedSecret = crypto
        .createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // මෙතන replaceAll වෙනුවට replace(/,/g, '') පාවිච්චි කරන්න
    const amountFormatted = amount
        .toLocaleString('en-us', { minimumFractionDigits: 2 })
        .replace(/,/g, ''); 

    const hash = crypto
        .createHash('md5')
        .update(merchantId + orderId + amountFormatted + currency + hashedSecret)
        .digest('hex')
        .toUpperCase();

    return hash;
};