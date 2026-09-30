import api from './api';
import * as categoryService from './categoryService';
import * as productService from './productService';
import * as orderService from './orderService';

const unwrap = (payload) => payload?.data ?? payload;

export const getDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return unwrap(data);
};

export const getUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  const body = unwrap(data);
  return {
    users: body.users || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/admin/users/${id}/status`, {
    accountStatus: payload.accountStatus || payload.account_status,
  });
  const body = unwrap(data);
  return body.user || body;
};

export const getSellers = async (params = {}) => {
  const { data } = await api.get('/admin/sellers', { params });
  const body = unwrap(data);
  return {
    sellers: body.sellers || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const updateSeller = async (id, payload) => {
  const status = payload.verification_status || payload.verificationStatus;
  const map = {
    approved: 'approve',
    rejected: 'reject',
    deactivated: 'deactivate',
  };
  const action = map[status];
  if (!action) {
    throw new Error('Select approved, rejected, or deactivated');
  }

  const { data } = await api.put(`/admin/sellers/${id}/${action}`, payload);
  const body = unwrap(data);
  return body.seller || body;
};

export const getProducts = async (params = {}) => {
  const { data } = await api.get('/admin/products', { params });
  const body = unwrap(data);
  return {
    products: body.products || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const updateProduct = async (id, payload) => productService.updateProduct(id, payload);

export const getOrders = async (params = {}) => {
  const { data } = await api.get('/admin/orders', { params });
  const body = unwrap(data);
  return {
    orders: body.orders || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const updateOrder = async (id, payload) =>
  orderService.updateOrderStatus(id, payload);

export const getCategories = async (params = {}) => {
  const { data } = await api.get('/admin/categories', { params });
  const body = unwrap(data);
  return body.categories || (Array.isArray(body) ? body : []);
};

export const createCategory = async (payload) => categoryService.createCategory(payload);

export const updateCategory = async (id, payload) =>
  categoryService.updateCategory(id, payload);

export const deleteCategory = async (id) => categoryService.deleteCategory(id);

export const getPayments = async (params = {}) => {
  const { data } = await api.get('/admin/payments', { params });
  const body = unwrap(data);
  return {
    payments: body.payments || (Array.isArray(body) ? body : []),
    pagination: body.pagination || null,
  };
};

export const getReports = async (params = {}) => {
  const { data } = await api.get('/admin/reports', { params });
  return unwrap(data);
};
