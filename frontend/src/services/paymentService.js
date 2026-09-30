import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const initiateMpesa = async ({ orderId, phone, phoneNumber }) => {
  const { data } = await api.post('/payments/mpesa/stk', {
    orderId,
    phoneNumber: phoneNumber || phone,
  });
  return unwrap(data);
};

export const getPaymentByOrder = async (orderId) => {
  const { data } = await api.get(`/payments/order/${orderId}`);
  const body = unwrap(data);
  return body.payments || body.payment || body;
};
