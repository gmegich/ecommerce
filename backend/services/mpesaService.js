const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { notifyPaymentSuccess, notifyOrderStatusChange } = require('./notificationService');

const isMockMode = () => {
  if (process.env.MPESA_MOCK_MODE === 'true') return true;
  if (process.env.MPESA_MOCK_MODE === 'false') return false;

  const hasCreds =
    process.env.MPESA_CONSUMER_KEY &&
    process.env.MPESA_CONSUMER_SECRET &&
    process.env.MPESA_PASSKEY &&
    process.env.MPESA_SHORTCODE;

  return !hasCreds;
};

/**
 * Normalize Kenyan phone to 2547XXXXXXXX.
 */
const normalizePhone = (phone) => {
  if (!phone) return null;
  let cleaned = String(phone).replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = `254${cleaned.slice(1)}`;
  } else if (cleaned.startsWith('7') && cleaned.length === 9) {
    cleaned = `254${cleaned}`;
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.replace(/^\+/, '');
  }

  return cleaned;
};

/**
 * Stub: obtain Daraja OAuth access token.
 * Replace with real Safaricom OAuth when credentials are configured.
 */
const getAccessToken = async () => {
  if (isMockMode()) {
    return { access_token: 'mock-access-token', expires_in: 3599 };
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const baseUrl =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`M-Pesa OAuth failed: ${text}`);
  }

  return response.json();
};

/**
 * Build Daraja STK password (timestamp + shortcode + passkey).
 */
const buildStkPassword = (timestamp) => {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
};

const getTimestamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
};

/**
 * Mark payment + order as paid and notify users.
 */
const markPaymentSuccessful = async (payment, extras = {}) => {
  const updatedPayment = await Payment.updateById(payment.id, {
    payment_status: 'paid',
    mpesa_receipt_number: extras.mpesaReceiptNumber || `MOCK${Date.now()}`,
    transaction_id: extras.transactionId || payment.transaction_id || `TXN-${Date.now()}`,
    transaction_date: extras.transactionDate || new Date().toISOString(),
    raw_callback: extras.rawCallback || null,
  });

  const order = await Order.updateStatus(payment.order_id, {
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
  });

  await notifyPaymentSuccess({
    userId: payment.user_id,
    orderNumber: order.order_number,
    amount: payment.amount,
  });

  await notifyOrderStatusChange(order, 'pending');

  return { payment: updatedPayment, order };
};

/**
 * Initiate STK Push (real Daraja stub or mock auto-success).
 */
const initiateStkPush = async ({ payment, phoneNumber }) => {
  const phone = normalizePhone(phoneNumber || payment.phone_number);

  if (isMockMode()) {
    const checkoutRequestId = `mock-checkout-${payment.id.slice(0, 8)}-${Date.now()}`;

    await Payment.updateById(payment.id, {
      payment_status: 'processing',
      phone_number: phone,
      transaction_id: checkoutRequestId,
      payment_method: 'mock',
    });

    // Auto-succeed shortly (simulate async callback)
    setTimeout(async () => {
      try {
        const current = await Payment.findById(payment.id);
        if (current && ['pending', 'processing'].includes(current.payment_status)) {
          await markPaymentSuccessful(current, {
            mpesaReceiptNumber: `MOCK${Date.now().toString().slice(-8)}`,
            transactionId: checkoutRequestId,
            rawCallback: {
              mock: true,
              ResultCode: 0,
              ResultDesc: 'The service request is processed successfully.',
            },
          });
        }
      } catch (err) {
        console.error('[M-Pesa Mock] Auto-success failed:', err.message);
      }
    }, 1500);

    return {
      mock: true,
      CheckoutRequestID: checkoutRequestId,
      MerchantRequestID: `mock-merchant-${Date.now()}`,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing (mock)',
      CustomerMessage: 'Check your phone for mock M-Pesa prompt (auto-succeeds)',
    };
  }

  // Real Daraja STK Push stub
  const tokenData = await getAccessToken();
  const timestamp = getTimestamp();
  const password = buildStkPassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const baseUrl =
    process.env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(Number(payment.amount)),
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: payment.order_id,
    TransactionDesc: 'NileLink Market payment',
  };

  const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok || result.ResponseCode !== '0') {
    await Payment.updateById(payment.id, {
      payment_status: 'failed',
      phone_number: phone,
      raw_callback: result,
    });
    throw new Error(result.errorMessage || result.ResponseDescription || 'STK Push failed');
  }

  await Payment.updateById(payment.id, {
    payment_status: 'processing',
    phone_number: phone,
    transaction_id: result.CheckoutRequestID,
    payment_method: 'mpesa',
    raw_callback: result,
  });

  return result;
};

/**
 * Handle Daraja STK callback payload.
 */
const handleStkCallback = async (callbackBody) => {
  const stkCallback = callbackBody?.Body?.stkCallback || callbackBody?.stkCallback || callbackBody;
  const checkoutRequestId = stkCallback?.CheckoutRequestID;
  const resultCode = stkCallback?.ResultCode;

  if (!checkoutRequestId) {
    return { success: false, message: 'Missing CheckoutRequestID' };
  }

  const payment = await Payment.findByTransactionId(checkoutRequestId);
  if (!payment) {
    return { success: false, message: 'Payment not found for CheckoutRequestID' };
  }

  if (resultCode === 0) {
    const metadata = stkCallback?.CallbackMetadata?.Item || [];
    const getMeta = (name) => metadata.find((i) => i.Name === name)?.Value;

    const { payment: updated, order } = await markPaymentSuccessful(payment, {
      mpesaReceiptNumber: getMeta('MpesaReceiptNumber'),
      transactionId: checkoutRequestId,
      transactionDate: new Date().toISOString(),
      rawCallback: callbackBody,
    });

    return { success: true, payment: updated, order };
  }

  const failed = await Payment.updateById(payment.id, {
    payment_status: 'failed',
    raw_callback: callbackBody,
  });

  await Order.updateStatus(payment.order_id, { paymentStatus: 'failed' });

  return { success: false, payment: failed, message: stkCallback?.ResultDesc || 'Payment failed' };
};

module.exports = {
  isMockMode,
  normalizePhone,
  getAccessToken,
  initiateStkPush,
  handleStkCallback,
  markPaymentSuccessful,
};
