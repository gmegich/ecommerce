import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  const body = unwrap(data);
  const orders = body.orders || (body.order ? [body.order] : Array.isArray(body) ? body : []);
  return {
    orders,
    order: orders[0] || null,
  };
};

export const getOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  const body = unwrap(data);
  return {
    orders: body.orders || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  const body = unwrap(data);
  return body.order || body;
};

export const cancelOrder = async (id) => {
  const { data } = await api.put(`/orders/${id}/cancel`);
  const body = unwrap(data);
  return body.order || body;
};

export const updateOrderStatus = async (id, payload) => {
  const bodyPayload = {
    orderStatus: payload.orderStatus || payload.order_status,
    deliveryStatus: payload.deliveryStatus || payload.delivery_status,
  };
  const { data } = await api.put(`/orders/${id}/status`, bodyPayload);
  const body = unwrap(data);
  return body.order || body;
};
