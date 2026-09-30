import api from './api';

const unwrap = (payload) => payload?.data ?? payload;

export const getDashboard = async () => {
  const { data } = await api.get('/seller/dashboard');
  return unwrap(data);
};

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products/seller/mine', { params });
  const body = unwrap(data);
  return {
    products: body.products || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
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

export const updateProfile = async (payload) => {
  const { data } = await api.put('/seller/profile', payload);
  const body = unwrap(data);
  return body.sellerProfile || body.seller || body;
};

export const getProfile = async () => {
  const { data } = await api.get('/seller/profile');
  const body = unwrap(data);
  return body.sellerProfile || body.seller || body;
};
